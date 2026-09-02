import { cn } from "@/lib/cn";

interface ReadoutProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

export function Readout({ label, value, emphasize }: ReadoutProps) {
  return (
    <div className={cn("border border-line bg-panel px-3 py-2", emphasize && "border-crimson/40")}>
      <p className="text-[11px] tracking-[0.12em] text-muted uppercase">{label}</p>
      <p className="mt-1 font-mono text-lg text-navy">{value}</p>
    </div>
  );
}
