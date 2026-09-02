import type { NodalCircuit } from "./nodal";

export function oneUnknownNode(R1: number, R2: number, R3: number, Vs: number): NodalCircuit {
  return {
    nodes: [
      { id: "n1", label: "V₁", kind: "unknown" },
      { id: "gnd", label: "GND", kind: "ground" },
      { id: "vs", label: "Vs", kind: "fixed", voltage: Vs },
    ],
    elements: [
      { id: "r1", type: "resistor", label: "R1", from: "n1", to: "vs", value: R1 },
      { id: "r2", type: "resistor", label: "R2", from: "n1", to: "gnd", value: R2 },
      { id: "r3", type: "resistor", label: "R3", from: "n1", to: "gnd", value: R3 },
    ],
  };
}

export function twoUnknownNodes(
  R1: number,
  R2: number,
  R12: number,
  Is: number,
): NodalCircuit {
  return {
    nodes: [
      { id: "n1", label: "V₁", kind: "unknown" },
      { id: "n2", label: "V₂", kind: "unknown" },
      { id: "gnd", label: "GND", kind: "ground" },
    ],
    elements: [
      { id: "r1", type: "resistor", label: "R1", from: "n1", to: "gnd", value: R1 },
      { id: "r2", type: "resistor", label: "R2", from: "n2", to: "gnd", value: R2 },
      { id: "r12", type: "resistor", label: "R12", from: "n1", to: "n2", value: R12 },
      { id: "is", type: "currentSource", label: "Is", from: "gnd", to: "n1", value: Is },
    ],
  };
}

export function groundedVoltageSource(R1: number, R2: number, Vs: number): NodalCircuit {
  return {
    nodes: [
      { id: "n1", label: "V₁", kind: "unknown" },
      { id: "gnd", label: "GND", kind: "ground" },
      { id: "vs", label: "Vs", kind: "fixed", voltage: Vs },
    ],
    elements: [
      { id: "src", type: "voltageSource", label: "Vs", plus: "vs", minus: "gnd", value: Vs },
      { id: "r1", type: "resistor", label: "R1", from: "vs", to: "n1", value: R1 },
      { id: "r2", type: "resistor", label: "R2", from: "n1", to: "gnd", value: R2 },
    ],
  };
}

export function currentSourceNode(R1: number, R2: number, Is: number): NodalCircuit {
  return {
    nodes: [
      { id: "n1", label: "V₁", kind: "unknown" },
      { id: "gnd", label: "GND", kind: "ground" },
    ],
    elements: [
      { id: "is", type: "currentSource", label: "Is", from: "gnd", to: "n1", value: Is },
      { id: "r1", type: "resistor", label: "R1", from: "n1", to: "gnd", value: R1 },
      { id: "r2", type: "resistor", label: "R2", from: "n1", to: "gnd", value: R2 },
    ],
  };
}

export function threeNodeNetwork(
  R1: number,
  R2: number,
  R3: number,
  R12: number,
  R23: number,
  Is: number,
): NodalCircuit {
  return {
    nodes: [
      { id: "n1", label: "V₁", kind: "unknown" },
      { id: "n2", label: "V₂", kind: "unknown" },
      { id: "n3", label: "V₃", kind: "unknown" },
      { id: "gnd", label: "GND", kind: "ground" },
    ],
    elements: [
      { id: "r1", type: "resistor", label: "R1", from: "n1", to: "gnd", value: R1 },
      { id: "r2", type: "resistor", label: "R2", from: "n2", to: "gnd", value: R2 },
      { id: "r3", type: "resistor", label: "R3", from: "n3", to: "gnd", value: R3 },
      { id: "r12", type: "resistor", label: "R12", from: "n1", to: "n2", value: R12 },
      { id: "r23", type: "resistor", label: "R23", from: "n2", to: "n3", value: R23 },
      { id: "is", type: "currentSource", label: "Is", from: "gnd", to: "n1", value: Is },
    ],
  };
}

export function coreLabCircuit(
  R1: number,
  R2: number,
  R3: number,
  Is: number,
  floatingVolts?: number,
): NodalCircuit {
  if (floatingVolts === undefined) {
    return twoUnknownNodes(R1, R3, R2, Is);
  }
  return {
    nodes: [
      { id: "n1", label: "V₁", kind: "unknown" },
      { id: "n2", label: "V₂", kind: "unknown" },
      { id: "gnd", label: "GND", kind: "ground" },
    ],
    elements: [
      { id: "r1", type: "resistor", label: "R1", from: "n1", to: "gnd", value: R1 },
      { id: "r3", type: "resistor", label: "R3", from: "n2", to: "gnd", value: R3 },
      { id: "is", type: "currentSource", label: "Is", from: "gnd", to: "n1", value: Is },
      { id: "vs", type: "voltageSource", label: "Vs", plus: "n2", minus: "n1", value: floatingVolts },
    ],
  };
}
