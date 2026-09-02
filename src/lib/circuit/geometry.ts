import type { Circuit, Junction, JunctionId } from "./types";

export const SNAP_RADIUS = 14;

export function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function midpoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function findNearestJunction(
  circuit: Circuit,
  x: number,
  y: number,
  exclude?: JunctionId,
  radius = SNAP_RADIUS,
): Junction | null {
  let best: Junction | null = null;
  let bestDist = radius;
  for (const junction of circuit.junctions) {
    if (exclude && junction.id === exclude) continue;
    const d = distance(x, y, junction.x, junction.y);
    if (d <= bestDist) {
      best = junction;
      bestDist = d;
    }
  }
  return best;
}

export function junctionMap(circuit: Circuit): Map<JunctionId, Junction> {
  return new Map(circuit.junctions.map((junction) => [junction.id, junction]));
}

export function terminalSide(
  from: { x: number; y: number },
  to: { x: number; y: number },
  which: "a" | "b",
): "left" | "right" | "top" | "bottom" {
  const point = which === "a" ? from : to;
  const other = which === "a" ? to : from;
  const vx = other.x - point.x;
  const vy = other.y - point.y;
  if (Math.abs(vx) > Math.abs(vy)) {
    return vx > 0 ? "left" : "right";
  }
  return vy > 0 ? "top" : "bottom";
}
