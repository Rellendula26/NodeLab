"use client";

import { cn } from "@/lib/cn";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: SliderControlProps) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm text-navy">{label}</span>
        <span className="font-mono text-sm text-steel">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none bg-cream accent-crimson",
          "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-navy",
        )}
      />
    </label>
  );
}
