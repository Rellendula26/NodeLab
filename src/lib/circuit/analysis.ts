import { analyzeCircuit } from "./topology";
import type {
  Circuit,
  CircuitAnalysis,
  CircuitElement,
  ElectricalNode,
  ElectricalNodeId,
  ElementId,
} from "./types";

export interface BranchCurrent {
  elementId: ElementId;
  /** Positive means entering the node along the element's current reference. */
  amps: number;
  entering: boolean;
}

export interface KCLResult {
  entering: number;
  leaving: number;
  algebraicSum: number;
  balanced: boolean;
}

/**
 * Kirchhoff's Current Law at a node.
 * `signedCurrents` uses the student's reference: positive = along the arrow.
 * `entering` says whether that reference arrow points into the node.
 */
export function calculateKCL(
  signedCurrents: Array<{ amps: number; entering: boolean }>,
): KCLResult {
  let entering = 0;
  let leaving = 0;
  let algebraicSum = 0;

  for (const branch of signedCurrents) {
    const towardNode = branch.entering ? branch.amps : -branch.amps;
    algebraicSum += towardNode;
    if (towardNode >= 0) entering += towardNode;
    else leaving += -towardNode;
  }

  return {
    entering,
    leaving,
    algebraicSum,
    balanced: Math.abs(algebraicSum) < 1e-9,
  };
}

export function calculateElementVoltage(
  element: CircuitElement,
  analysis: CircuitAnalysis,
): number | null {
  if (element.terminals.length < 2) return null;
  const plus = element.plusTerminal ?? element.terminals[0];
  const minus = element.terminals.find((id) => id !== plus);
  if (!minus) return null;

  const plusNode = analysis.nodes.find((node) => node.id === analysis.junctionToNode[plus]);
  const minusNode = analysis.nodes.find((node) => node.id === analysis.junctionToNode[minus]);
  if (!plusNode || !minusNode) return null;
  if (plusNode.voltage === null || minusNode.voltage === null) return null;
  return plusNode.voltage - minusNode.voltage;
}

export function calculateResistorCurrent(
  element: CircuitElement,
  voltage: number | null,
): number | null {
  if (element.type !== "resistor" || voltage === null) return null;
  const resistance = element.value ?? 0;
  if (resistance === 0) return null;
  return voltage / resistance;
}

export function calculatePower(voltage: number | null, current: number | null): number | null {
  if (voltage === null || current === null) return null;
  return voltage * current;
}

export function resistorPowerSet(
  voltage: number,
  current: number,
  resistance: number,
): { vi: number; i2r: number; v2r: number } {
  return {
    vi: voltage * current,
    i2r: current * current * resistance,
    v2r: resistance === 0 ? 0 : (voltage * voltage) / resistance,
  };
}

export interface SimpleLoop {
  nodeIds: ElectricalNodeId[];
  elementIds: ElementId[];
}

/**
 * Simple cycles in the electrical graph (elements are edges between nodes).
 */
export function findSimpleLoops(circuit: Circuit, analysis?: CircuitAnalysis): SimpleLoop[] {
  const resolved = analysis ?? analyzeCircuit(circuit);
  const adjacency = new Map<ElectricalNodeId, Array<{ nodeId: ElectricalNodeId; elementId: ElementId }>>();

  for (const node of resolved.nodes) {
    adjacency.set(node.id, []);
  }

  for (const element of circuit.elements) {
    const binding = resolved.elementBindings[element.id];
    if (!binding || binding.nodeIds.length !== 2) continue;
    const [a, b] = binding.nodeIds;
    if (a === b) continue;
    adjacency.get(a)?.push({ nodeId: b, elementId: element.id });
    adjacency.get(b)?.push({ nodeId: a, elementId: element.id });
  }

  const loops: SimpleLoop[] = [];
  const seen = new Set<string>();

  function dfs(
    start: ElectricalNodeId,
    current: ElectricalNodeId,
    pathNodes: ElectricalNodeId[],
    pathElements: ElementId[],
    used: Set<ElementId>,
  ) {
    const neighbors = adjacency.get(current) ?? [];
    for (const edge of neighbors) {
      if (used.has(edge.elementId)) continue;
      if (edge.nodeId === start && pathNodes.length >= 2) {
        const key = [...pathElements, edge.elementId].slice().sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          loops.push({
            nodeIds: [...pathNodes, start],
            elementIds: [...pathElements, edge.elementId],
          });
        }
        continue;
      }
      if (pathNodes.includes(edge.nodeId)) continue;
      used.add(edge.elementId);
      dfs(start, edge.nodeId, [...pathNodes, edge.nodeId], [...pathElements, edge.elementId], used);
      used.delete(edge.elementId);
    }
  }

  for (const node of resolved.nodes) {
    dfs(node.id, node.id, [node.id], [], new Set());
  }

  return loops;
}

export function nodeById(
  analysis: CircuitAnalysis,
  id: ElectricalNodeId,
): ElectricalNode | undefined {
  return analysis.nodes.find((node) => node.id === id);
}
