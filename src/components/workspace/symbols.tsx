import { formatOhms } from "@/lib/circuit";

interface ResistorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  value?: number;
  selected?: boolean;
  dimmed?: boolean;
}

export function ResistorSymbol({
  x1,
  y1,
  x2,
  y2,
  label,
  value,
  selected,
  dimmed,
}: ResistorProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const bodyW = Math.min(54, Math.max(36, length * 0.42));
  const bodyH = 18;
  const lead = (length - bodyW) / 2;
  const nx = -uy;
  const ny = ux;
  const labelX = midX + nx * 22;
  const labelY = midY + ny * 22;

  return (
    <g className={dimmed ? "opacity-45" : undefined}>
      <line
        x1={x1}
        y1={y1}
        x2={x1 + ux * lead}
        y2={y1 + uy * lead}
        className="stroke-lab-wire"
        strokeWidth={2.2}
      />
      <line
        x1={x2}
        y1={y2}
        x2={x2 - ux * lead}
        y2={y2 - uy * lead}
        className="stroke-lab-wire"
        strokeWidth={2.2}
      />
      <rect
        x={midX - bodyW / 2}
        y={midY - bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={2}
        transform={`rotate(${angle} ${midX} ${midY})`}
        className={selected ? "fill-lab-paper stroke-lab-copper" : "fill-lab-paper stroke-lab-ink"}
        strokeWidth={selected ? 2.4 : 1.8}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-lab-ink font-mono text-[11px] font-medium"
      >
        {label}
        {value !== undefined ? ` · ${formatOhms(value)}` : ""}
      </text>
    </g>
  );
}

interface GroundProps {
  x: number;
  y: number;
  highlighted?: boolean;
}

export function GroundSymbol({ x, y, highlighted }: GroundProps) {
  const stroke = highlighted ? "stroke-lab-copper" : "stroke-lab-ink";
  return (
    <g transform={`translate(${x} ${y})`} className={stroke}>
      <line x1={0} y1={0} x2={0} y2={20} strokeWidth={2} />
      <line x1={-15} y1={20} x2={15} y2={20} strokeWidth={2.2} />
      <line x1={-10} y1={26} x2={10} y2={26} strokeWidth={2} />
      <line x1={-4} y1={32} x2={4} y2={32} strokeWidth={2} />
    </g>
  );
}
