import { findNearestJunction, SNAP_RADIUS } from "./geometry";
import { createId } from "./ids";
import { nextResistorLabel } from "./topology";
import type { Circuit, CircuitElement, Junction, JunctionId, WireId } from "./types";

function replaceJunctions(circuit: Circuit, junctions: Junction[]): Circuit {
  return { ...circuit, junctions };
}

export function moveJunction(circuit: Circuit, id: JunctionId, x: number, y: number): Circuit {
  return replaceJunctions(
    circuit,
    circuit.junctions.map((junction) => (junction.id === id ? { ...junction, x, y } : junction)),
  );
}

export function mergeJunctions(circuit: Circuit, keepId: JunctionId, absorbId: JunctionId): Circuit {
  if (keepId === absorbId) return circuit;

  const remap = (id: JunctionId) => (id === absorbId ? keepId : id);

  const wires = circuit.wires
    .map((wire) => ({ ...wire, from: remap(wire.from), to: remap(wire.to) }))
    .filter((wire) => wire.from !== wire.to);

  const elements = circuit.elements.map((element) => ({
    ...element,
    terminals: element.terminals.map(remap),
    plusTerminal: element.plusTerminal ? remap(element.plusTerminal) : undefined,
    currentFrom: element.currentFrom ? remap(element.currentFrom) : undefined,
    currentTo: element.currentTo ? remap(element.currentTo) : undefined,
  }));

  return {
    junctions: circuit.junctions.filter((junction) => junction.id !== absorbId),
    wires,
    elements,
  };
}

export function snapJunction(circuit: Circuit, id: JunctionId): Circuit {
  const junction = circuit.junctions.find((item) => item.id === id);
  if (!junction) return circuit;
  const near = findNearestJunction(circuit, junction.x, junction.y, id, SNAP_RADIUS);
  if (!near) return circuit;
  return mergeJunctions(circuit, near.id, id);
}

export function addResistor(circuit: Circuit, x: number, y: number): Circuit {
  const left: Junction = { id: createId("j"), x: x - 50, y };
  const right: Junction = { id: createId("j"), x: x + 50, y };
  const element: CircuitElement = {
    id: createId("e"),
    type: "resistor",
    label: nextResistorLabel(circuit),
    terminals: [left.id, right.id],
    value: 1000,
    plusTerminal: left.id,
    currentFrom: left.id,
    currentTo: right.id,
  };

  let next: Circuit = {
    ...circuit,
    junctions: [...circuit.junctions, left, right],
    elements: [...circuit.elements, element],
  };
  next = snapJunction(next, left.id);
  next = snapJunction(next, right.id);
  return next;
}

export function addGround(circuit: Circuit, x: number, y: number): Circuit {
  const near = findNearestJunction(circuit, x, y);
  const junction = near ?? { id: createId("j"), x, y };
  const element: CircuitElement = {
    id: createId("e"),
    type: "ground",
    label: "GND",
    terminals: [junction.id],
  };

  return {
    ...circuit,
    junctions: near ? circuit.junctions : [...circuit.junctions, junction],
    elements: [...circuit.elements, element],
  };
}

export function addWire(
  circuit: Circuit,
  from: { x: number; y: number },
  to: { x: number; y: number },
): Circuit {
  const startNear = findNearestJunction(circuit, from.x, from.y);
  const start = startNear ?? { id: createId("j"), x: from.x, y: from.y };
  let next: Circuit = startNear
    ? circuit
    : { ...circuit, junctions: [...circuit.junctions, start] };

  const endNear = findNearestJunction(next, to.x, to.y, start.id);
  const end = endNear ?? { id: createId("j"), x: to.x, y: to.y };
  if (!endNear) {
    next = { ...next, junctions: [...next.junctions, end] };
  }

  if (start.id === end.id) return circuit;

  return {
    ...next,
    wires: [...next.wires, { id: createId("w"), from: start.id, to: end.id }],
  };
}

export function removeWire(circuit: Circuit, wireId: WireId): Circuit {
  return { ...circuit, wires: circuit.wires.filter((wire) => wire.id !== wireId) };
}

export function removeElement(circuit: Circuit, elementId: string): Circuit {
  const element = circuit.elements.find((item) => item.id === elementId);
  if (!element) return circuit;

  const remaining = circuit.elements.filter((item) => item.id !== elementId);
  const used = new Set<string>();
  for (const item of remaining) {
    for (const terminal of item.terminals) used.add(terminal);
  }
  for (const wire of circuit.wires) {
    used.add(wire.from);
    used.add(wire.to);
  }

  return {
    ...circuit,
    elements: remaining,
    junctions: circuit.junctions.filter((junction) => {
      if (used.has(junction.id)) return true;
      return !element.terminals.includes(junction.id);
    }),
  };
}

export function pruneOrphanJunctions(circuit: Circuit): Circuit {
  const used = new Set<string>();
  for (const element of circuit.elements) {
    for (const terminal of element.terminals) used.add(terminal);
  }
  for (const wire of circuit.wires) {
    used.add(wire.from);
    used.add(wire.to);
  }
  return {
    ...circuit,
    junctions: circuit.junctions.filter((junction) => used.has(junction.id)),
  };
}
