import { terminalSide } from "./geometry";
import type {
  Circuit,
  CircuitAnalysis,
  CircuitElement,
  ElectricalNode,
  ElectricalNodeId,
  ElementId,
  ElementRelation,
  JunctionId,
  RelationExplanation,
  TerminalTouch,
  WireId,
} from "./types";
import { UnionFind } from "./unionFind";

const NODE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function isTwoTerminal(element: CircuitElement): boolean {
  return element.type !== "ground" && element.terminals.length >= 2;
}

/**
 * Build electrical nodes from the schematic graph.
 *
 * Wires and identical grounds CONNECT a node.
 * Resistors and sources INTERRUPT a node.
 */
export function analyzeCircuit(circuit: Circuit): CircuitAnalysis {
  const uf = new UnionFind(circuit.junctions.map((junction) => junction.id));

  for (const wire of circuit.wires) {
    if (ufHas(uf, wire.from) && ufHas(uf, wire.to)) {
      uf.union(wire.from, wire.to);
    }
  }

  const grounds = circuit.elements.filter((element) => element.type === "ground");
  const groundJunctions = grounds
    .map((element) => element.terminals[0])
    .filter((id): id is JunctionId => Boolean(id));

  if (groundJunctions.length > 0) {
    const first = groundJunctions[0];
    for (const junctionId of groundJunctions.slice(1)) {
      uf.union(first, junctionId);
    }
  }

  const groups = new Map<JunctionId, JunctionId[]>();
  for (const junction of circuit.junctions) {
    const root = uf.find(junction.id);
    const list = groups.get(root) ?? [];
    list.push(junction.id);
    groups.set(root, list);
  }

  const groundRoots = new Set(groundJunctions.map((id) => uf.find(id)));

  const ranked = [...groups.entries()].sort((a, b) => {
    const aGround = groundRoots.has(a[0]) ? 0 : 1;
    const bGround = groundRoots.has(b[0]) ? 0 : 1;
    if (aGround !== bGround) return aGround - bGround;
    return a[1][0].localeCompare(b[1][0]);
  });

  const nodes: ElectricalNode[] = ranked.map(([root, junctionIds], index) => {
    const isGround = groundRoots.has(root);
    const letter = NODE_LETTERS[isGround ? 0 : Math.min(index - (groundRoots.size > 0 ? 1 : 0), NODE_LETTERS.length - 1)];
    return {
      id: `n_${root}`,
      label: isGround ? "GND" : `Node ${letter}`,
      junctionIds,
      isGround,
      voltage: isGround ? 0 : null,
      incidentElementIds: [],
      extraordinary: false,
    };
  });

  const junctionToNode: Record<JunctionId, ElectricalNodeId> = {};
  for (const node of nodes) {
    for (const junctionId of node.junctionIds) {
      junctionToNode[junctionId] = node.id;
    }
  }

  const elementBindings: CircuitAnalysis["elementBindings"] = {};
  for (const element of circuit.elements) {
    const nodeIds = unique(
      element.terminals
        .map((terminal) => junctionToNode[terminal])
        .filter((id): id is ElectricalNodeId => Boolean(id)),
    );
    elementBindings[element.id] = { elementId: element.id, nodeIds };

    if (!isTwoTerminal(element)) continue;
    for (const nodeId of nodeIds) {
      const node = nodes.find((item) => item.id === nodeId);
      if (node && !node.incidentElementIds.includes(element.id)) {
        node.incidentElementIds.push(element.id);
      }
    }
  }

  for (const node of nodes) {
    node.extraordinary = node.incidentElementIds.length >= 3;
  }

  return { nodes, junctionToNode, elementBindings };
}

function ufHas(uf: UnionFind<JunctionId>, id: JunctionId): boolean {
  try {
    uf.find(id);
    return true;
  } catch {
    return false;
  }
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function getElectricalNode(
  analysis: CircuitAnalysis,
  junctionId: JunctionId,
): ElectricalNode | undefined {
  const nodeId = analysis.junctionToNode[junctionId];
  return analysis.nodes.find((node) => node.id === nodeId);
}

export function getConnectedNode(
  circuit: Circuit,
  analysis: CircuitAnalysis,
  target: { junctionId?: JunctionId; wireId?: WireId },
): ElectricalNode | undefined {
  if (target.junctionId) {
    return getElectricalNode(analysis, target.junctionId);
  }
  if (target.wireId) {
    const wire = circuit.wires.find((item) => item.id === target.wireId);
    if (!wire) return undefined;
    return getElectricalNode(analysis, wire.from);
  }
  return undefined;
}

export function getExtraordinaryNodes(analysis: CircuitAnalysis): ElectricalNode[] {
  return analysis.nodes.filter((node) => node.extraordinary);
}

export function areParallel(
  analysis: CircuitAnalysis,
  elementA: ElementId,
  elementB: ElementId,
): boolean {
  if (elementA === elementB) return false;
  const a = analysis.elementBindings[elementA];
  const b = analysis.elementBindings[elementB];
  if (!a || !b || a.nodeIds.length !== 2 || b.nodeIds.length !== 2) return false;
  const [a1, a2] = a.nodeIds;
  return (
    (a1 === b.nodeIds[0] && a2 === b.nodeIds[1]) ||
    (a1 === b.nodeIds[1] && a2 === b.nodeIds[0])
  );
}

export function areSeries(
  analysis: CircuitAnalysis,
  elementA: ElementId,
  elementB: ElementId,
): boolean {
  if (elementA === elementB) return false;
  if (areParallel(analysis, elementA, elementB)) return false;

  const a = analysis.elementBindings[elementA];
  const b = analysis.elementBindings[elementB];
  if (!a || !b) return false;

  const shared = a.nodeIds.filter((id) => b.nodeIds.includes(id));
  if (shared.length !== 1) return false;

  const sharedNode = analysis.nodes.find((node) => node.id === shared[0]);
  if (!sharedNode) return false;

  return (
    sharedNode.incidentElementIds.length === 2 &&
    sharedNode.incidentElementIds.includes(elementA) &&
    sharedNode.incidentElementIds.includes(elementB)
  );
}

export function classifyRelationship(
  analysis: CircuitAnalysis,
  elementA: CircuitElement,
  elementB: CircuitElement,
): RelationExplanation {
  if (elementA.type === "ground" || elementB.type === "ground") {
    return {
      relation: "neither",
      summary: `${elementA.label} and ${elementB.label} cannot be series or parallel — ground is a reference, not a two-terminal branch.`,
      why: "Series and parallel are relationships between branches that each connect two electrical nodes.",
      sharedNodeIds: overlap(analysis, elementA.id, elementB.id),
    };
  }

  if (areParallel(analysis, elementA.id, elementB.id)) {
    const nodes = analysis.elementBindings[elementA.id]?.nodeIds ?? [];
    const labels = nodeLabels(analysis, nodes);
    return {
      relation: "parallel",
      summary: `${elementA.label} and ${elementB.label} are parallel because both terminals connect to ${labels[0]} and ${labels[1]}.`,
      why: "Parallel is a topology fact, not a drawing fact. Distance on the page does not matter — only the two electrical nodes do.",
      sharedNodeIds: nodes,
    };
  }

  if (areSeries(analysis, elementA.id, elementB.id)) {
    const shared = overlap(analysis, elementA.id, elementB.id);
    const label = nodeLabels(analysis, shared)[0] ?? "their shared node";
    return {
      relation: "series",
      summary: `${elementA.label} and ${elementB.label} are series because they share ${label}, and current cannot branch there.`,
      why: "At a series connection the shared node has exactly two branches. Every coulomb that leaves one element must enter the other.",
      sharedNodeIds: shared,
    };
  }

  const shared = overlap(analysis, elementA.id, elementB.id);
  if (shared.length === 1) {
    const node = analysis.nodes.find((item) => item.id === shared[0]);
    const extras = (node?.incidentElementIds ?? []).filter(
      (id) => id !== elementA.id && id !== elementB.id,
    );
    const extraLabels = extras
      .map((id) => id)
      .join(", ");
    return {
      relation: "neither",
      summary: `${elementA.label} and ${elementB.label} are not in series because their shared node also connects to another branch, allowing current to split.`,
      why:
        extras.length > 0
          ? `They share ${node?.label ?? "a node"}, but that node also touches ${extraLabels}. Current has somewhere else to go.`
          : "They share a node, but the series test fails because current can still branch.",
      sharedNodeIds: shared,
    };
  }

  if (shared.length === 0) {
    return {
      relation: "neither",
      summary: `${elementA.label} and ${elementB.label} share no electrical node, so they are neither series nor parallel.`,
      why: "Series needs a shared node with no extra branch. Parallel needs both of the same two nodes.",
      sharedNodeIds: [],
    };
  }

  return {
    relation: "neither",
    summary: `${elementA.label} and ${elementB.label} are neither series nor parallel.`,
    why: "The topology matches neither definition.",
    sharedNodeIds: shared,
  };
}

function overlap(
  analysis: CircuitAnalysis,
  a: ElementId,
  b: ElementId,
): ElectricalNodeId[] {
  const left = analysis.elementBindings[a]?.nodeIds ?? [];
  const right = analysis.elementBindings[b]?.nodeIds ?? [];
  return left.filter((id) => right.includes(id));
}

function nodeLabels(analysis: CircuitAnalysis, ids: ElectricalNodeId[]): string[] {
  return ids.map((id) => analysis.nodes.find((node) => node.id === id)?.label ?? id);
}

export function terminalsOnNode(
  circuit: Circuit,
  analysis: CircuitAnalysis,
  node: ElectricalNode,
): TerminalTouch[] {
  const junctions = new Map(circuit.junctions.map((junction) => [junction.id, junction]));
  const touches: TerminalTouch[] = [];

  for (const element of circuit.elements) {
    element.terminals.forEach((terminal, index) => {
      if (analysis.junctionToNode[terminal] !== node.id) return;
      const here = junctions.get(terminal);
      const otherId = element.terminals.find((id) => id !== terminal) ?? terminal;
      const other = junctions.get(otherId);
      const side =
        here && other && here.id !== other.id
          ? terminalSide(here, other, "a")
          : "end";

      touches.push({
        elementId: element.id,
        elementLabel: element.label,
        elementType: element.type,
        terminalIndex: index,
        side,
      });
    });
  }

  return touches;
}

export function nextResistorLabel(circuit: Circuit): string {
  const used = new Set(
    circuit.elements
      .filter((element) => element.type === "resistor")
      .map((element) => element.label),
  );
  for (let i = 1; i < 100; i += 1) {
    const label = `R${i}`;
    if (!used.has(label)) return label;
  }
  return `R${circuit.elements.length + 1}`;
}
