"use client";

import { useEffect, useMemo, useState } from "react";
import { SidePanel } from "@/components/panels/SidePanel";
import { Toolbar } from "@/components/panels/Toolbar";
import { CircuitCanvas } from "@/components/workspace/CircuitCanvas";
import { useCircuit } from "@/hooks/useCircuit";
import { DEFAULT_CIRCUIT, PRESETS, getElectricalNode } from "@/lib/circuit";

export function NodeLab() {
  const circuitState = useCircuit(DEFAULT_CIRCUIT);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [presetId, setPresetId] = useState<string>("looks-can-lie");

  const selectedNode = useMemo(
    () => circuitState.analysis.nodes.find((node) => node.id === circuitState.selectedNodeId),
    [circuitState.analysis.nodes, circuitState.selectedNodeId],
  );

  const selectedElement = useMemo(
    () => circuitState.circuit.elements.find((element) => element.id === circuitState.selectedElementId),
    [circuitState.circuit.elements, circuitState.selectedElementId],
  );

  const { deleteSelected, selectNode, selectElement, setWireDraft, setTool } = circuitState;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === "Escape") {
        selectNode(null);
        setWireDraft(null);
        setTool("select");
      }
      if ((event.key === "Backspace" || event.key === "Delete") && tag !== "INPUT" && tag !== "SELECT") {
        event.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, selectNode, setTool, setWireDraft]);

  function handleJunctionClick(junctionId: string) {
    const junction = circuitState.circuit.junctions.find((item) => item.id === junctionId);
    if (!junction) return;

    if (circuitState.tool !== "select") {
      circuitState.placeAt(junction.x, junction.y);
      return;
    }

    const node = getElectricalNode(circuitState.analysis, junctionId);
    circuitState.selectNode(node?.id ?? null);
  }

  function handleBackground(x: number, y: number) {
    if (circuitState.tool === "select") {
      selectNode(null);
      selectElement(null);
      return;
    }
    circuitState.placeAt(x, y);
  }

  function loadPreset(id: string) {
    const preset = PRESETS.find((item) => item.id === id);
    if (preset) {
      setPresetId(id);
      circuitState.loadCircuit(preset.circuit);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-lab-paper text-lab-ink">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-lab-line px-5 py-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-lab-copper uppercase">
            Node Explorer
          </p>
          <h1 className="font-serif text-2xl tracking-tight">Find the electrical node, not the drawing</h1>
        </div>
      </header>

      <Toolbar
        tool={circuitState.tool}
        onTool={(tool) => {
          circuitState.setTool(tool);
          circuitState.setWireDraft(null);
        }}
        showExtraordinary={circuitState.showExtraordinary}
        onExtraordinary={circuitState.setShowExtraordinary}
        showNodeLabels={circuitState.showNodeLabels}
        onNodeLabels={circuitState.setShowNodeLabels}
        presetId={presetId}
        onLoadPreset={loadPreset}
        onReset={() => {
          setPresetId("looks-can-lie");
          circuitState.loadCircuit(DEFAULT_CIRCUIT);
        }}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className={`relative min-h-[520px] ${circuitState.tool === "select" ? "cursor-default" : "cursor-crosshair"}`}>
          <CircuitCanvas
            circuit={circuitState.circuit}
            analysis={circuitState.analysis}
            tool={circuitState.tool}
            selectedNode={selectedNode}
            selectedElementId={circuitState.selectedElementId}
            wireDraft={circuitState.wireDraft}
            cursor={cursor}
            showExtraordinary={circuitState.showExtraordinary}
            showNodeLabels={circuitState.showNodeLabels}
            onCursor={setCursor}
            onBackgroundClick={handleBackground}
            onJunctionClick={handleJunctionClick}
            onWireClick={(junctionId) => {
              if (circuitState.tool !== "select") {
                handleJunctionClick(junctionId);
                return;
              }
              const node = getElectricalNode(circuitState.analysis, junctionId);
              circuitState.selectNode(node?.id ?? null);
            }}
            onElementClick={(id) => {
              if (circuitState.tool !== "select") return;
              circuitState.selectElement(id);
            }}
            onDragJunction={circuitState.dragJunction}
            onFinishDrag={circuitState.finishDrag}
          />
          <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] text-lab-muted">
            {hintFor(circuitState.tool, circuitState.wireDraft !== null)}
          </p>
        </main>

        <SidePanel
          circuit={circuitState.circuit}
          analysis={circuitState.analysis}
          selectedNode={selectedNode}
          selectedElement={selectedElement}
          showWhy={circuitState.showWhy}
          onToggleWhy={() => circuitState.setShowWhy(!circuitState.showWhy)}
        />
      </div>
    </div>
  );
}

function hintFor(tool: string, wiring: boolean): string {
  if (tool === "wire") {
    return wiring ? "Click the second terminal — snaps to nearby dots." : "Click a start point for the wire.";
  }
  if (tool === "resistor") return "Click the bench to drop a 1 kΩ resistor. Drag dots to reshape.";
  if (tool === "ground") return "Click to place a ground. A second ground is the same reference node.";
  return "Click a wire or junction. Drag a junction dot to reshape.";
}
