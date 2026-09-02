"use client";

import { useRef } from "react";
import type { Circuit, CircuitAnalysis, ElectricalNode, JunctionId, Tool } from "@/lib/circuit";
import { junctionMap } from "@/lib/circuit";
import { GroundSymbol, ResistorSymbol } from "./symbols";

const VIEW_W = 800;
const VIEW_H = 460;

interface CircuitCanvasProps {
  circuit: Circuit;
  analysis: CircuitAnalysis;
  tool: Tool;
  selectedNode: ElectricalNode | undefined;
  selectedElementId: string | null;
  wireDraft: { x: number; y: number } | null;
  cursor: { x: number; y: number } | null;
  showExtraordinary: boolean;
  showNodeLabels: boolean;
  onCursor: (point: { x: number; y: number } | null) => void;
  onBackgroundClick: (x: number, y: number) => void;
  onJunctionClick: (id: JunctionId) => void;
  onWireClick: (junctionId: JunctionId) => void;
  onElementClick: (id: string) => void;
  onDragJunction: (id: JunctionId, x: number, y: number) => void;
  onFinishDrag: (id: JunctionId) => void;
}

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

export function CircuitCanvas({
  circuit,
  analysis,
  tool,
  selectedNode,
  selectedElementId,
  wireDraft,
  cursor,
  showExtraordinary,
  showNodeLabels,
  onCursor,
  onBackgroundClick,
  onJunctionClick,
  onWireClick,
  onElementClick,
  onDragJunction,
  onFinishDrag,
}: CircuitCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragId = useRef<JunctionId | null>(null);
  const junctions = junctionMap(circuit);
  const selectedSet = new Set(selectedNode?.junctionIds ?? []);

  function pointerPos(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return toSvgPoint(svg, event.clientX, event.clientY);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full touch-none"
      role="img"
      aria-label="Circuit workspace"
      onPointerMove={(event) => {
        const point = pointerPos(event);
        onCursor(point);
        if (dragId.current) {
          onDragJunction(dragId.current, point.x, point.y);
        }
      }}
      onPointerLeave={() => onCursor(null)}
      onPointerUp={(event) => {
        if (dragId.current) {
          onFinishDrag(dragId.current);
          dragId.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget && (event.target as Element).tagName !== "rect") {
          return;
        }
        const point = pointerPos(event);
        onBackgroundClick(point.x, point.y);
      }}
    >
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} className="fill-lab-paper" />
      <Grid />

      {selectedNode && (
        <NodeGlow circuit={circuit} node={selectedNode} junctions={junctions} />
      )}

      {circuit.wires.map((wire) => {
        const from = junctions.get(wire.from);
        const to = junctions.get(wire.to);
        if (!from || !to) return null;
        const active = selectedSet.has(wire.from);
        return (
          <g key={wire.id}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="stroke-transparent"
              strokeWidth={16}
              onPointerDown={(event) => {
                event.stopPropagation();
                onWireClick(wire.from);
              }}
            />
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={active ? "stroke-lab-copper" : "stroke-lab-wire"}
              strokeWidth={active ? 3.4 : 2.2}
              pointerEvents="none"
            />
          </g>
        );
      })}

      {wireDraft && cursor && tool === "wire" && (
        <line
          x1={wireDraft.x}
          y1={wireDraft.y}
          x2={cursor.x}
          y2={cursor.y}
          className="stroke-lab-copper"
          strokeWidth={2}
          strokeDasharray="6 5"
          pointerEvents="none"
        />
      )}

      {circuit.elements.map((element) => {
        if (element.type === "ground") {
          const junction = junctions.get(element.terminals[0]);
          if (!junction) return null;
          const highlighted = selectedSet.has(junction.id);
          return (
            <g
              key={element.id}
              onPointerDown={(event) => {
                event.stopPropagation();
                onJunctionClick(junction.id);
              }}
            >
              <GroundSymbol x={junction.x} y={junction.y} highlighted={highlighted} />
            </g>
          );
        }

        const a = junctions.get(element.terminals[0]);
        const b = junctions.get(element.terminals[1]);
        if (!a || !b) return null;
        return (
          <g
            key={element.id}
            onPointerDown={(event) => {
              event.stopPropagation();
              onElementClick(element.id);
            }}
          >
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="stroke-transparent"
              strokeWidth={22}
            />
            <ResistorSymbol
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              label={element.label}
              value={element.value}
              selected={selectedElementId === element.id}
            />
          </g>
        );
      })}

      {selectedNode &&
        circuit.elements.flatMap((element) =>
          element.terminals.map((terminal, index) => {
            if (!selectedSet.has(terminal)) return null;
            const junction = junctions.get(terminal);
            if (!junction) return null;
            return (
              <rect
                key={`${element.id}-${index}`}
                x={junction.x - 4}
                y={junction.y - 4}
                width={8}
                height={8}
                rx={1}
                className="fill-lab-paper stroke-lab-copper"
                strokeWidth={1.6}
                pointerEvents="none"
              />
            );
          }),
        )}

      {circuit.junctions.map((junction) => {
        const nodeId = analysis.junctionToNode[junction.id];
        const node = analysis.nodes.find((item) => item.id === nodeId);
        const active = selectedSet.has(junction.id);
        const extraordinary = Boolean(showExtraordinary && node?.extraordinary);
        return (
          <g
            key={junction.id}
            onPointerDown={(event) => {
              event.stopPropagation();
              if (tool === "select") {
                dragId.current = junction.id;
                event.currentTarget.setPointerCapture?.(event.pointerId);
              }
              onJunctionClick(junction.id);
            }}
          >
            <circle cx={junction.x} cy={junction.y} r={12} className="fill-transparent" />
            {extraordinary && (
              <circle
                cx={junction.x}
                cy={junction.y}
                r={11}
                className="fill-none stroke-lab-teal"
                strokeWidth={1.6}
              />
            )}
            <circle
              cx={junction.x}
              cy={junction.y}
              r={active ? 5.5 : 4.2}
              className={active ? "fill-lab-copper" : "fill-lab-ink"}
            />
          </g>
        );
      })}

      {showNodeLabels &&
        analysis.nodes.map((node) => {
          const points = node.junctionIds
            .map((id) => junctions.get(id))
            .filter((item): item is NonNullable<typeof item> => Boolean(item));
          if (points.length === 0) return null;
          const anchor = points.reduce((left, point) => (point.x < left.x ? point : left));
          const x = anchor.x;
          const y = anchor.y - 16;
          const active = selectedNode?.id === node.id;
          return (
            <g key={node.id}>
              <text
                x={x}
                y={y}
                textAnchor="start"
                className={`font-mono text-[11px] font-semibold ${
                  active ? "fill-lab-copper" : "fill-lab-muted"
                }`}
              >
                {node.label}
                {node.isGround ? " = 0 V" : ""}
              </text>
              {showExtraordinary && node.extraordinary && (
                <text x={x} y={y + 12} textAnchor="start" className="fill-lab-teal font-mono text-[9px]">
                  3+ branches
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}

function Grid() {
  return (
    <g className="pointer-events-none">
      {Array.from({ length: 26 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={20 + i * 30}
          y1={16}
          x2={20 + i * 30}
          y2={444}
          className="stroke-lab-grid"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={20}
          y1={16 + i * 30}
          x2={780}
          y2={16 + i * 30}
          className="stroke-lab-grid"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

function NodeGlow({
  circuit,
  node,
  junctions,
}: {
  circuit: Circuit;
  node: ElectricalNode;
  junctions: ReturnType<typeof junctionMap>;
}) {
  const selected = new Set(node.junctionIds);
  return (
    <g className="pointer-events-none">
      {circuit.wires.map((wire) => {
        if (!selected.has(wire.from)) return null;
        const from = junctions.get(wire.from);
        const to = junctions.get(wire.to);
        if (!from || !to) return null;
        return (
          <line
            key={`glow-${wire.id}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-lab-copper/30"
            strokeWidth={14}
            strokeLinecap="round"
          />
        );
      })}
      {node.junctionIds.map((id) => {
        const junction = junctions.get(id);
        if (!junction) return null;
        return (
          <circle
            key={`glow-${id}`}
            cx={junction.x}
            cy={junction.y}
            r={16}
            className="fill-lab-copper/20"
          />
        );
      })}
    </g>
  );
}
