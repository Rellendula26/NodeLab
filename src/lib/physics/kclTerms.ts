import type { NodalCircuit, NodalSolution } from "./nodal";

export interface KclTerm {
  elementId: string;
  label: string;
  latex: string;
  amps: number;
}

function nodeSymbol(circuit: NodalCircuit, id: string): string {
  const node = circuit.nodes.find((item) => item.id === id);
  if (!node) return id;
  if (node.kind === "ground") return "0";
  if (node.kind === "fixed") return `${node.voltage}`;
  return node.label;
}

export function kclTermsForNode(
  circuit: NodalCircuit,
  nodeId: string,
  solution: NodalSolution,
): KclTerm[] {
  const terms: KclTerm[] = [];

  for (const element of circuit.elements) {
    if (element.type === "resistor") {
      if (element.from !== nodeId && element.to !== nodeId) continue;
      const other = element.from === nodeId ? element.to : element.from;
      const sign = element.from === nodeId ? 1 : -1;
      const amps = sign * solution.resistorCurrents[element.id];
      const self = nodeSymbol(circuit, nodeId);
      const far = nodeSymbol(circuit, other);
      terms.push({
        elementId: element.id,
        label: element.label,
        latex: `\\dfrac{${self}-${far}}{${element.label}}`,
        amps,
      });
    }
    if (element.type === "currentSource") {
      if (element.to === nodeId) {
        terms.push({
          elementId: element.id,
          label: element.label,
          latex: `-${element.label}`,
          amps: -element.value,
        });
      } else if (element.from === nodeId) {
        terms.push({
          elementId: element.id,
          label: element.label,
          latex: `${element.label}`,
          amps: element.value,
        });
      }
    }
  }

  return terms;
}
