"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addGround,
  addResistor,
  addWire,
  analyzeCircuit,
  moveJunction,
  removeElement,
  snapJunction,
  type Circuit,
  type ElectricalNodeId,
  type ElementId,
  type JunctionId,
  type Tool,
} from "@/lib/circuit";

export function useCircuit(initial: Circuit) {
  const [circuit, setCircuit] = useState<Circuit>(initial);
  const [tool, setTool] = useState<Tool>("select");
  const [selectedNodeId, setSelectedNodeId] = useState<ElectricalNodeId | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<ElementId | null>(null);
  const [wireDraft, setWireDraft] = useState<{ x: number; y: number } | null>(null);
  const [showExtraordinary, setShowExtraordinary] = useState(false);
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showWhy, setShowWhy] = useState(true);

  const analysis = useMemo(() => analyzeCircuit(circuit), [circuit]);

  const loadCircuit = useCallback((next: Circuit) => {
    setCircuit(next);
    setSelectedNodeId(null);
    setSelectedElementId(null);
    setWireDraft(null);
    setTool("select");
  }, []);

  const selectNode = useCallback((nodeId: ElectricalNodeId | null) => {
    setSelectedNodeId(nodeId);
    setSelectedElementId(null);
  }, []);

  const selectElement = useCallback((elementId: ElementId | null) => {
    setSelectedElementId(elementId);
    setSelectedNodeId(null);
  }, []);

  const placeAt = useCallback(
    (x: number, y: number) => {
      if (tool === "resistor") {
        setCircuit((current) => addResistor(current, x, y));
        return;
      }
      if (tool === "ground") {
        setCircuit((current) => addGround(current, x, y));
        return;
      }
      if (tool === "wire") {
        if (!wireDraft) {
          setWireDraft({ x, y });
          return;
        }
        setCircuit((current) => addWire(current, wireDraft, { x, y }));
        setWireDraft(null);
      }
    },
    [tool, wireDraft],
  );

  const dragJunction = useCallback((id: JunctionId, x: number, y: number) => {
    setCircuit((current) => moveJunction(current, id, x, y));
  }, []);

  const finishDrag = useCallback((id: JunctionId) => {
    setCircuit((current) => snapJunction(current, id));
  }, []);

  const deleteSelected = useCallback(() => {
    setSelectedElementId((currentId) => {
      if (currentId) {
        setCircuit((current) => removeElement(current, currentId));
      }
      return null;
    });
  }, []);

  return {
    circuit,
    analysis,
    tool,
    setTool,
    selectedNodeId,
    selectedElementId,
    wireDraft,
    setWireDraft,
    showExtraordinary,
    setShowExtraordinary,
    showNodeLabels,
    setShowNodeLabels,
    showWhy,
    setShowWhy,
    loadCircuit,
    selectNode,
    selectElement,
    placeAt,
    dragJunction,
    finishDrag,
    deleteSelected,
  };
}
