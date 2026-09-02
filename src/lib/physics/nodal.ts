import { solveLinearSystem } from "./solve";

export type NodalNodeKind = "unknown" | "ground" | "fixed";

export interface NodalNode {
  id: string;
  label: string;
  kind: NodalNodeKind;
  voltage?: number;
}

export type NodalElement =
  | {
      id: string;
      type: "resistor";
      label: string;
      from: string;
      to: string;
      value: number;
    }
  | {
      id: string;
      type: "currentSource";
      label: string;
      from: string;
      to: string;
      value: number;
    }
  | {
      id: string;
      type: "voltageSource";
      label: string;
      plus: string;
      minus: string;
      value: number;
    };

export interface NodalCircuit {
  nodes: NodalNode[];
  elements: NodalElement[];
}

export interface NodalSolution {
  voltages: Record<string, number>;
  resistorCurrents: Record<string, number>;
  conductance: number[][];
  unknownIds: string[];
  rhs: number[];
}

function nodeVoltage(node: NodalNode): number {
  if (node.kind === "ground") return 0;
  if (node.kind === "fixed") return node.voltage ?? 0;
  throw new Error(`Unknown node ${node.id} is not solved yet.`);
}

/**
 * Resistive nodal analysis. Voltage sources must have one terminal
 * that is ground or another fixed node (no supernode in this solver).
 */
export function solveNodal(circuit: NodalCircuit): NodalSolution {
  const nodes = circuit.nodes.map((node) => ({ ...node }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const unknowns = nodes.filter((node) => node.kind === "unknown");
  const index = new Map(unknowns.map((node, i) => [node.id, i]));
  const n = unknowns.length;
  const G = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  const rhs = Array.from({ length: n }, () => 0);

  function knownPotential(id: string): number | null {
    const node = byId.get(id);
    if (!node) throw new Error(`Missing node ${id}`);
    if (node.kind === "unknown") return null;
    return node.kind === "ground" ? 0 : (node.voltage ?? 0);
  }

  function stampCurrentInto(id: string, amps: number) {
    const i = index.get(id);
    if (i === undefined) return;
    rhs[i] += amps;
  }

  function stampConductance(a: string, b: string, g: number) {
    const ia = index.get(a);
    const ib = index.get(b);
    const Va = knownPotential(a);
    const Vb = knownPotential(b);

    if (ia !== undefined && ib !== undefined) {
      G[ia][ia] += g;
      G[ib][ib] += g;
      G[ia][ib] -= g;
      G[ib][ia] -= g;
      return;
    }
    if (ia !== undefined && Vb !== null) {
      G[ia][ia] += g;
      rhs[ia] += g * Vb;
    }
    if (ib !== undefined && Va !== null) {
      G[ib][ib] += g;
      rhs[ib] += g * Va;
    }
  }

  for (const element of circuit.elements) {
    if (element.type === "resistor") {
      if (element.value <= 0) throw new Error(`${element.label} must be positive.`);
      stampConductance(element.from, element.to, 1 / element.value);
    } else if (element.type === "currentSource") {
      stampCurrentInto(element.to, element.value);
      stampCurrentInto(element.from, -element.value);
    } else {
      const plus = byId.get(element.plus);
      const minus = byId.get(element.minus);
      if (!plus || !minus) throw new Error(`Voltage source ${element.label} has unknown terminals.`);
      const plusKnown = plus.kind !== "unknown";
      const minusKnown = minus.kind !== "unknown";
      if (plusKnown && minusKnown) {
        const expected = (plus.kind === "ground" ? 0 : (plus.voltage ?? 0)) -
          (minus.kind === "ground" ? 0 : (minus.voltage ?? 0));
        if (Math.abs(expected - element.value) > 1e-9) {
          throw new Error(`Inconsistent voltage source ${element.label}.`);
        }
      } else if (minusKnown && plus.kind === "unknown") {
        plus.kind = "fixed";
        plus.voltage = (minus.kind === "ground" ? 0 : (minus.voltage ?? 0)) + element.value;
      } else if (plusKnown && minus.kind === "unknown") {
        minus.kind = "fixed";
        minus.voltage = (plus.kind === "ground" ? 0 : (plus.voltage ?? 0)) - element.value;
      } else {
        throw new Error(
          `Floating voltage source ${element.label} needs a supernode. Use a grounded source here.`,
        );
      }
    }
  }

  const remaining = nodes.filter((node) => node.kind === "unknown");
  if (remaining.length !== n) {
    return solveNodal({
      nodes,
      elements: circuit.elements.filter((element) => element.type !== "voltageSource"),
    });
  }

  const solved = n === 0 ? [] : solveLinearSystem(G, rhs);
  const voltages: Record<string, number> = {};
  for (const node of nodes) {
    voltages[node.id] = node.kind === "unknown" ? solved[index.get(node.id)!] : nodeVoltage(node);
  }

  const resistorCurrents: Record<string, number> = {};
  for (const element of circuit.elements) {
    if (element.type !== "resistor") continue;
    resistorCurrents[element.id] = (voltages[element.from] - voltages[element.to]) / element.value;
  }

  return { voltages, resistorCurrents, conductance: G, unknownIds: unknowns.map((node) => node.id), rhs };
}

export function inspectionMatrix(circuit: NodalCircuit): {
  labels: string[];
  G: number[][];
} {
  const unknowns = circuit.nodes.filter((node) => node.kind === "unknown");
  const index = new Map(unknowns.map((node, i) => [node.id, i]));
  const n = unknowns.length;
  const G = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

  for (const element of circuit.elements) {
    if (element.type !== "resistor") continue;
    const g = 1 / element.value;
    const i = index.get(element.from);
    const j = index.get(element.to);
    if (i !== undefined) G[i][i] += g;
    if (j !== undefined) G[j][j] += g;
    if (i !== undefined && j !== undefined) {
      G[i][j] -= g;
      G[j][i] -= g;
    }
  }

  return { labels: unknowns.map((node) => node.label), G };
}
