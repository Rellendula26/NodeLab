"use client";

import type { Circuit, CircuitAnalysis, CircuitElement, ElectricalNode, TerminalTouch } from "@/lib/circuit";
import { terminalsOnNode } from "@/lib/circuit";

interface SidePanelProps {
  circuit: Circuit;
  analysis: CircuitAnalysis;
  selectedNode?: ElectricalNode;
  selectedElement?: CircuitElement;
  showWhy: boolean;
  onToggleWhy: () => void;
}

export function SidePanel({
  circuit,
  analysis,
  selectedNode,
  selectedElement,
  showWhy,
  onToggleWhy,
}: SidePanelProps) {
  const terminals = selectedNode ? terminalsOnNode(circuit, analysis, selectedNode) : [];
  const groundCount = selectedNode
    ? circuit.elements.filter(
        (element) =>
          element.type === "ground" &&
          element.terminals.some((terminal) => selectedNode.junctionIds.includes(terminal)),
      ).length
    : 0;

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-lab-line bg-lab-panel">
      <div className="border-b border-lab-line px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-lab-teal uppercase">
          Why this is true
        </p>
        <h2 className="mt-1 font-serif text-2xl text-lab-ink">Node Lab</h2>
        <p className="mt-1 text-sm leading-relaxed text-lab-muted">
          Identify the node first. Geometry on the page is not topology.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
        {!selectedNode && !selectedElement && <IdleCopy />}

        {selectedElement && <ElementCopy element={selectedElement} />}

        {selectedNode && (
          <NodeCopy
            node={selectedNode}
            terminals={terminals}
            groundCount={groundCount}
          />
        )}

        <button
          type="button"
          onClick={onToggleWhy}
          className="mt-5 rounded-full border border-lab-line px-3 py-1.5 text-sm font-medium text-lab-ink hover:bg-lab-paper"
        >
          {showWhy ? "Hide Why?" : "Why?"}
        </button>

        {showWhy && (
          <p className="mt-3 text-sm leading-6 text-lab-ink/90">
            {whyText(selectedNode, selectedElement, groundCount, terminals)}
          </p>
        )}
      </div>

      <div className="border-t border-lab-line px-5 py-3 text-xs text-lab-muted">
        Phase 1 of 5 · Click a wire or junction · Resistors interrupt nodes
      </div>
    </aside>
  );
}

function IdleCopy() {
  return (
    <div className="space-y-3 text-sm leading-6 text-lab-ink">
      <p>Click any wire segment or junction dot.</p>
      <p className="text-lab-muted">
        The highlighted region is one electrical node: every point connected by ideal wire, and
        nothing beyond a resistor.
      </p>
    </div>
  );
}

function ElementCopy({ element }: { element: CircuitElement }) {
  if (element.type === "ground") {
    return (
      <div className="space-y-2 text-sm leading-6">
        <h3 className="font-serif text-xl text-lab-ink">Ground symbol</h3>
        <p>Ground marks the voltage reference. Click the junction to see the whole node.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm leading-6">
      <h3 className="font-serif text-xl text-lab-ink">{element.label} is an element</h3>
      <p>
        A resistor interrupts a node. Voltage can exist across {element.label}, so its two
        terminals usually belong to two different nodes.
      </p>
      <p className="text-lab-muted">Click a wire or junction to inspect a node.</p>
    </div>
  );
}

function NodeCopy({
  node,
  terminals,
  groundCount,
}: {
  node: ElectricalNode;
  terminals: TerminalTouch[];
  groundCount: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-2xl text-lab-ink">{node.label}</h3>
          {node.isGround && (
            <span className="rounded-full bg-lab-ink px-2 py-0.5 font-mono text-xs text-lab-paper">
              0 V
            </span>
          )}
          {node.extraordinary && (
            <span className="rounded-full bg-lab-teal/15 px-2 py-0.5 text-xs font-medium text-lab-teal">
              Extraordinary
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-lab-ink">
          All points on this node have the same electric potential.
        </p>
        {groundCount >= 2 && (
          <p className="mt-2 text-sm leading-6 text-lab-copper">
            These points are the same electrical node. Both ground symbols are one reference.
          </p>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-lab-muted uppercase">
          Terminals on this node
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {terminals.length === 0 && (
            <li className="text-lab-muted">No element terminals — just wire.</li>
          )}
          {terminals.map((touch) => (
            <li key={`${touch.elementId}-${touch.terminalIndex}`} className="flex gap-2">
              <span className="font-mono text-lab-ink">{touch.elementLabel}</span>
              <span className="text-lab-muted">
                {touch.elementType === "ground" ? "reference" : `${touch.side} terminal`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {node.extraordinary && (
        <p className="text-sm leading-6 text-lab-teal">
          {node.incidentElementIds.length} branches meet here, so current can split. That is an
          extraordinary node.
        </p>
      )}
    </div>
  );
}

function whyText(
  node: ElectricalNode | undefined,
  element: CircuitElement | undefined,
  groundCount: number,
  terminals: TerminalTouch[],
): string {
  if (element && element.type !== "ground") {
    return `Think of ${element.label} as a wall for potential. Ideal wire is a hallway: walk as far as you want and the potential stays the same. The hallway ends at the resistor.`;
  }

  if (!node) {
    return "A node is not one dot. It is the entire set of points joined by wire. If you have to cross a resistor to get there, you have changed nodes.";
  }

  if (node.isGround) {
    return groundCount >= 2
      ? "Identical ground symbols are the same reference, even if they are drawn on opposite sides of the page. Ground is a voltage reference — it is not automatically a physical earth connection or a current sink."
      : "This node is the reference. We call its potential 0 V so every other node voltage is measured from here.";
  }

  const names = terminals
    .filter((touch) => touch.elementType !== "ground")
    .map((touch) => touch.elementLabel);
  if (names.length === 0) {
    return "These junctions are shorted together by ideal wire, so they cannot have different voltages.";
  }

  return `You can walk from any highlighted dot to any other highlighted dot using only wire. ${names.join(", ")} touch this node, but each resistor also has another terminal that is a different node.`;
}
