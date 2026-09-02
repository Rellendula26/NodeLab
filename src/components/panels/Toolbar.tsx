"use client";

import { PRESETS, type Tool } from "@/lib/circuit";

const TOOLS: Array<{ id: Tool; label: string; hint: string }> = [
  { id: "select", label: "Select", hint: "Click a wire or junction" },
  { id: "resistor", label: "Resistor", hint: "Click the bench to place" },
  { id: "wire", label: "Wire", hint: "Click two points" },
  { id: "ground", label: "Ground", hint: "Click a junction or empty space" },
];

interface ToolbarProps {
  tool: Tool;
  onTool: (tool: Tool) => void;
  showExtraordinary: boolean;
  onExtraordinary: (value: boolean) => void;
  showNodeLabels: boolean;
  onNodeLabels: (value: boolean) => void;
  presetId: string;
  onLoadPreset: (id: string) => void;
  onReset: () => void;
}

export function Toolbar({
  tool,
  onTool,
  showExtraordinary,
  onExtraordinary,
  showNodeLabels,
  onNodeLabels,
  presetId,
  onLoadPreset,
  onReset,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-lab-line bg-lab-panel/90 px-4 py-3">
      <div className="flex flex-wrap gap-1.5">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.hint}
            onClick={() => onTool(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              tool === item.id
                ? "bg-lab-ink text-lab-paper"
                : "bg-lab-paper text-lab-ink hover:bg-lab-ink/8"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="ml-auto flex items-center gap-2 text-sm text-lab-muted">
        Circuit
        <select
          className="rounded-md border border-lab-line bg-lab-paper px-2 py-1 text-lab-ink"
          value={presetId}
          onChange={(event) => onLoadPreset(event.target.value)}
        >
          {PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-lab-ink">
        <input
          type="checkbox"
          checked={showNodeLabels}
          onChange={(event) => onNodeLabels(event.target.checked)}
        />
        Node labels
      </label>

      <label className="flex items-center gap-2 text-sm text-lab-ink">
        <input
          type="checkbox"
          checked={showExtraordinary}
          onChange={(event) => onExtraordinary(event.target.checked)}
        />
        Show extraordinary nodes
      </label>

      <button
        type="button"
        onClick={onReset}
        className="text-sm text-lab-muted underline-offset-2 hover:text-lab-ink hover:underline"
      >
        Reset
      </button>
    </div>
  );
}
