import { cn } from "@/lib/cn";

export function CircuitWire({
  x1,
  y1,
  x2,
  y2,
  highlight = false,
  dimmed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={cn(
        highlight ? "stroke-crimson" : "stroke-wire",
        dimmed && "opacity-25",
      )}
      strokeWidth={highlight ? 3 : 2}
    />
  );
}

export function Resistor({
  x1,
  y1,
  x2,
  y2,
  label,
  highlight = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  highlight?: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const bodyW = Math.min(48, Math.max(32, length * 0.4));
  const bodyH = 16;
  const lead = (length - bodyW) / 2;
  const nx = -uy;
  const ny = ux;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x1 + ux * lead}
        y2={y1 + uy * lead}
        className={highlight ? "stroke-crimson" : "stroke-wire"}
        strokeWidth={2}
      />
      <line
        x1={x2}
        y1={y2}
        x2={x2 - ux * lead}
        y2={y2 - uy * lead}
        className={highlight ? "stroke-crimson" : "stroke-wire"}
        strokeWidth={2}
      />
      <rect
        x={midX - bodyW / 2}
        y={midY - bodyH / 2}
        width={bodyW}
        height={bodyH}
        transform={`rotate(${angle} ${midX} ${midY})`}
        className={highlight ? "fill-panel stroke-crimson" : "fill-panel stroke-navy"}
        strokeWidth={1.6}
      />
      {label && (
        <text
          x={midX + nx * 20}
          y={midY + ny * 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-navy font-mono text-[11px]"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function VoltageSource({
  cx,
  cy,
  plusToward,
  label,
  value,
}: {
  cx: number;
  cy: number;
  plusToward: "up" | "down" | "left" | "right";
  label?: string;
  value?: string;
}) {
  const plus =
    plusToward === "up"
      ? { x: 0, y: -12 }
      : plusToward === "down"
        ? { x: 0, y: 12 }
        : plusToward === "left"
          ? { x: -12, y: 0 }
          : { x: 12, y: 0 };

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={16} className="fill-panel stroke-navy" strokeWidth={1.6} />
      <text x={plus.x} y={plus.y + 1} textAnchor="middle" dominantBaseline="middle" className="fill-navy text-[11px]">
        +
      </text>
      <text x={-plus.x} y={-plus.y + 1} textAnchor="middle" dominantBaseline="middle" className="fill-muted text-[14px]">
        −
      </text>
      {(label || value) && (
        <text x={24} y={4} className="fill-navy font-mono text-[11px]">
          {[label, value].filter(Boolean).join(" ")}
        </text>
      )}
    </g>
  );
}

export function CurrentSource({
  cx,
  cy,
  pointing,
  label,
}: {
  cx: number;
  cy: number;
  pointing: "up" | "down" | "left" | "right";
  label?: string;
}) {
  const rotate = pointing === "up" ? -90 : pointing === "down" ? 90 : pointing === "left" ? 180 : 0;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
      <circle r={16} className="fill-panel stroke-navy" strokeWidth={1.6} />
      <line x1={-8} y1={0} x2={6} y2={0} className="stroke-navy" strokeWidth={1.6} />
      <polygon points="6,-4 13,0 6,4" className="fill-navy" />
      {label && (
        <text x={0} y={-24} textAnchor="middle" className="fill-navy font-mono text-[11px]">
          {label}
        </text>
      )}
    </g>
  );
}

export function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="stroke-navy">
      <line x1={0} y1={0} x2={0} y2={12} strokeWidth={1.6} />
      <line x1={-12} y1={12} x2={12} y2={12} strokeWidth={1.8} />
      <line x1={-8} y1={17} x2={8} y2={17} strokeWidth={1.6} />
      <line x1={-3} y1={22} x2={3} y2={22} strokeWidth={1.6} />
    </g>
  );
}

export function NodeDot({
  x,
  y,
  label,
  voltage,
  highlight = false,
  onClick,
}: {
  x: number;
  y: number;
  label?: string;
  voltage?: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <g onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
      <circle
        cx={x}
        cy={y}
        r={highlight ? 6 : 4.5}
        className={highlight ? "fill-crimson" : "fill-navy"}
      />
      {label && (
        <text x={x + 10} y={y - 10} className="fill-navy font-mono text-[11px]">
          {label}
          {voltage ? ` = ${voltage}` : ""}
        </text>
      )}
    </g>
  );
}

export function CurrentArrow({
  x,
  y,
  angle,
  label,
  muted = false,
}: {
  x: number;
  y: number;
  angle: number;
  label?: string;
  muted?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={muted ? 0.45 : 1}>
      <line x1={-10} y1={0} x2={8} y2={0} className="stroke-crimson" strokeWidth={1.6} />
      <polygon points="8,-4 16,0 8,4" className="fill-crimson" />
      {label && (
        <text x={0} y={-8} textAnchor="middle" className="fill-crimson font-mono text-[10px]">
          {label}
        </text>
      )}
    </g>
  );
}

export function VoltageLabel({
  x,
  y,
  text,
  accent = false,
}: {
  x: number;
  y: number;
  text: string;
  accent?: boolean;
}) {
  return (
    <text x={x} y={y} className={cn("font-mono text-[12px]", accent ? "fill-crimson" : "fill-navy")}>
      {text}
    </text>
  );
}

export function SupernodeBoundary({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={8}
      className="fill-steel/10 stroke-steel"
      strokeDasharray="6 4"
      strokeWidth={1.4}
    />
  );
}

export function DependentSource({
  cx,
  cy,
  label,
}: {
  cx: number;
  cy: number;
  label?: string;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <polygon points="0,-18 18,0 0,18 -18,0" className="fill-panel stroke-navy" strokeWidth={1.6} />
      {label && (
        <text x={26} y={4} className="fill-navy font-mono text-[11px]">
          {label}
        </text>
      )}
    </g>
  );
}
