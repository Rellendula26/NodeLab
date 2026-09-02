"use client";

import { useMemo, useState } from "react";
import { CurrentParticles } from "@/components/circuit/CurrentParticles";
import {
  CurrentSource,
  Ground,
  NodeDot,
  Resistor,
  VoltageSource,
} from "@/components/circuit/primitives";
import { CauseEffect } from "@/components/ui/CauseEffect";
import { Equation } from "@/components/ui/Equation";
import { Readout } from "@/components/ui/Readout";
import { SliderControl } from "@/components/ui/SliderControl";
import { WhyPanel } from "@/components/ui/WhyPanel";
import { formatAmps, formatOhms, formatVolts } from "@/lib/physics/format";
import { kclTermsForNode } from "@/lib/physics/kclTerms";
import { inspectionMatrix, solveNodal } from "@/lib/physics/nodal";
import {
  currentSourceNode,
  groundedVoltageSource,
  oneUnknownNode,
  threeNodeNetwork,
  twoUnknownNodes,
} from "@/lib/physics/presets";

const STEPS = [
  "Identify Nodes",
  "Choose Ground",
  "Assume Currents Leave",
  "Write KCL",
  "Substitute Ohm’s Law",
  "Solve",
];

const PRESET_OPTIONS = [
  { id: "one", name: "One unknown node" },
  { id: "two", name: "Two unknown nodes" },
  { id: "grounded", name: "Grounded voltage source" },
  { id: "current", name: "Current source" },
  { id: "three", name: "Three-node network" },
] as const;

export function NodalBuilderSim() {
  const [preset, setPreset] = useState<(typeof PRESET_OPTIONS)[number]["id"]>("one");
  const [step, setStep] = useState(0);
  const [R1, setR1] = useState(2000);
  const [R2, setR2] = useState(4000);
  const [R3, setR3] = useState(6000);
  const [Vs, setVs] = useState(12);
  const [Is, setIs] = useState(0.003);
  const [selected, setSelected] = useState("n1");
  const [hoverTerm, setHoverTerm] = useState<string | null>(null);

  const circuit = useMemo(() => {
    if (preset === "one") return oneUnknownNode(R1, R2, R3, Vs);
    if (preset === "two") return twoUnknownNodes(R1, R2, R3, Is);
    if (preset === "grounded") return groundedVoltageSource(R1, R2, Vs);
    if (preset === "current") return currentSourceNode(R1, R2, Is);
    return threeNodeNetwork(R1, R2, R3, 2000, 3000, Is);
  }, [preset, R1, R2, R3, Vs, Is]);

  const solution = useMemo(() => solveNodal(circuit), [circuit]);
  const matrix = useMemo(() => inspectionMatrix(circuit), [circuit]);
  const terms = useMemo(
    () => kclTermsForNode(circuit, selected, solution),
    [circuit, selected, solution],
  );
  const selectedVoltage = solution.voltages[selected] ?? 0;

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2 text-[12px]">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`border px-2 py-1 ${
              index === step ? "border-navy bg-navy text-bg" : "border-line text-muted"
            }`}
          >
            {index + 1} {label}
          </li>
        ))}
      </ol>

      <CauseEffect
        text={
          step < 3
            ? "Click a node. Every connected branch belongs to that KCL statement — geometry is just the drawing."
            : `At ${circuit.nodes.find((node) => node.id === selected)?.label ?? selected}, the leaving currents sum to about ${formatAmps(terms.reduce((sum, term) => sum + term.amps, 0))}. Ohm’s law turned each current into a voltage difference over a resistance.`
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-line bg-panel p-4 notebook-grid">
          <NodalDiagram
            preset={preset}
            solution={solution}
            selected={selected}
            hoverTerm={hoverTerm}
            R1={R1}
            R2={R2}
            R3={R3}
            Vs={Vs}
            Is={Is}
            onSelect={setSelected}
            revealVoltages={step >= 5}
          />
        </div>

        <div className="space-y-4 border border-line bg-panel p-5">
          <label className="block text-sm">
            <span className="text-muted">Preset circuit</span>
            <select
              className="mt-1 w-full border border-line bg-bg px-2 py-1.5 text-navy"
              value={preset}
              onChange={(event) => {
                setPreset(event.target.value as typeof preset);
                setSelected("n1");
                setStep(0);
              }}
            >
              {PRESET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <SliderControl
            label="R1"
            value={R1}
            min={500}
            max={8000}
            step={100}
            display={formatOhms(R1)}
            onChange={setR1}
          />
          <SliderControl
            label="R2"
            value={R2}
            min={500}
            max={8000}
            step={100}
            display={formatOhms(R2)}
            onChange={setR2}
          />
          {(preset === "one" || preset === "three" || preset === "two") && (
            <SliderControl
              label={preset === "two" ? "R12" : "R3"}
              value={R3}
              min={500}
              max={8000}
              step={100}
              display={formatOhms(R3)}
              onChange={setR3}
            />
          )}
          {(preset === "one" || preset === "grounded") && (
            <SliderControl
              label="Vs"
              value={Vs}
              min={1}
              max={20}
              step={0.1}
              display={formatVolts(Vs)}
              onChange={setVs}
            />
          )}
          {(preset === "two" || preset === "current" || preset === "three") && (
            <SliderControl
              label="Is"
              value={Is * 1000}
              min={0.2}
              max={8}
              step={0.1}
              display={formatAmps(Is)}
              onChange={(value) => setIs(value / 1000)}
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="border border-navy px-3 py-1.5 text-sm disabled:opacity-40"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Back
            </button>
            <button
              type="button"
              className="border border-navy bg-navy px-3 py-1.5 text-sm text-bg disabled:opacity-40"
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
            >
              Next step
            </button>
          </div>
        </div>
      </div>

      {step >= 3 && (
        <div className="border border-line bg-panel p-5">
          <p className="text-sm text-muted">
            Hover a term to light its branch. Each term is a current assumed leaving the selected
            node.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-lg">
            {terms.map((term, index) => (
              <button
                key={term.elementId}
                type="button"
                onMouseEnter={() => setHoverTerm(term.elementId)}
                onMouseLeave={() => setHoverTerm(null)}
                className={`border px-2 py-1 ${
                  hoverTerm === term.elementId ? "border-crimson bg-cream" : "border-line"
                }`}
              >
                <Equation math={term.latex} />
                {index < terms.length - 1 && <span className="ml-2 text-muted">+</span>}
              </button>
            ))}
            <span className="text-navy">= 0</span>
          </div>
          {step >= 5 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {Object.entries(solution.voltages)
                .filter(([id]) => id !== "gnd")
                .map(([id, voltage]) => (
                  <Readout
                    key={id}
                    label={circuit.nodes.find((node) => node.id === id)?.label ?? id}
                    value={formatVolts(voltage)}
                    emphasize={id === selected}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {step >= 4 && (
        <div className="overflow-x-auto border border-line bg-panel p-5">
          <p className="text-sm text-muted">
            Optional matrix view G V = I. Diagonal entries collect conductances touching that node.
            Off-diagonal entries are the negative shared conductances.
          </p>
          <div className="mt-3 font-mono text-sm">
            {matrix.G.map((row, i) => (
              <div key={matrix.labels[i]} className="flex gap-3">
                <span className="w-10 text-muted">{matrix.labels[i]}</span>
                {row.map((value, j) => (
                  <span
                    key={`${i}-${j}`}
                    className={i === j ? "text-navy" : "text-crimson"}
                    title={
                      i === j
                        ? "Sum of conductances on this node"
                        : "−g shared with the other node"
                    }
                  >
                    {value.toExponential(2)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-muted">
        Selected node voltage {formatVolts(selectedVoltage)}. The KCL residual at this node is{" "}
        {formatAmps(terms.reduce((sum, term) => sum + term.amps, 0))}.
      </p>

      <WhyPanel>
        <p>
          We never invent extra loop currents. Each unknown is a node potential. Ohm’s law writes
          every resistor current as a difference of those potentials, so KCL becomes an equation in
          the V’s alone.
        </p>
      </WhyPanel>
    </div>
  );
}

function NodalDiagram({
  preset,
  solution,
  selected,
  hoverTerm,
  R1,
  R2,
  R3,
  Vs,
  Is,
  onSelect,
  revealVoltages,
}: {
  preset: string;
  solution: ReturnType<typeof solveNodal>;
  selected: string;
  hoverTerm: string | null;
  R1: number;
  R2: number;
  R3: number;
  Vs: number;
  Is: number;
  onSelect: (id: string) => void;
  revealVoltages: boolean;
}) {
  const v = (id: string) =>
    revealVoltages ? formatVolts(solution.voltages[id] ?? 0) : undefined;

  if (preset === "two") {
    return (
      <svg viewBox="0 0 420 280" className="h-auto w-full">
        <CurrentSource cx={60} cy={80} pointing="up" label={`Is ${formatAmps(Is)}`} />
        <line x1={60} y1={96} x2={60} y2={200} className="stroke-wire" strokeWidth={2} />
        <line x1={60} y1={64} x2={60} y2={40} className="stroke-wire" strokeWidth={2} />
        <line x1={60} y1={40} x2={160} y2={40} className="stroke-wire" strokeWidth={2} />
        <Resistor x1={160} y1={40} x2={160} y2={140} label={`R1 ${formatOhms(R1)}`} highlight={hoverTerm === "r1"} />
        <Resistor x1={160} y1={40} x2={300} y2={40} label={`R12 ${formatOhms(R3)}`} highlight={hoverTerm === "r12"} />
        <Resistor x1={300} y1={40} x2={300} y2={140} label={`R2 ${formatOhms(R2)}`} highlight={hoverTerm === "r2"} />
        <line x1={60} y1={200} x2={300} y2={200} className="stroke-wire" strokeWidth={2} />
        <Ground x={180} y={200} />
        <NodeDot x={160} y={40} label="V₁" voltage={v("n1")} highlight={selected === "n1"} onClick={() => onSelect("n1")} />
        <NodeDot x={300} y={40} label="V₂" voltage={v("n2")} highlight={selected === "n2"} onClick={() => onSelect("n2")} />
        <CurrentParticles pathId="nb-is" d="M60 200 V40" current={Is} />
      </svg>
    );
  }

  if (preset === "current") {
    return (
      <svg viewBox="0 0 360 240" className="h-auto w-full">
        <CurrentSource cx={60} cy={90} pointing="up" label={`Is ${formatAmps(Is)}`} />
        <line x1={60} y1={40} x2={200} y2={40} className="stroke-wire" strokeWidth={2} />
        <Resistor x1={140} y1={40} x2={140} y2={150} label={`R1 ${formatOhms(R1)}`} highlight={hoverTerm === "r1"} />
        <Resistor x1={240} y1={40} x2={240} y2={150} label={`R2 ${formatOhms(R2)}`} highlight={hoverTerm === "r2"} />
        <line x1={60} y1={150} x2={240} y2={150} className="stroke-wire" strokeWidth={2} />
        <Ground x={150} y={150} />
        <NodeDot x={200} y={40} label="V₁" voltage={v("n1")} highlight={selected === "n1"} onClick={() => onSelect("n1")} />
        <CurrentParticles pathId="nb-c" d="M60 150 V40 H200" current={Is} />
      </svg>
    );
  }

  if (preset === "three") {
    return (
      <svg viewBox="0 0 460 240" className="h-auto w-full">
        <CurrentSource cx={40} cy={90} pointing="up" label="Is" />
        <line x1={40} y1={40} x2={100} y2={40} className="stroke-wire" strokeWidth={2} />
        <Resistor x1={100} y1={40} x2={100} y2={150} label="R1" highlight={hoverTerm === "r1"} />
        <Resistor x1={100} y1={40} x2={230} y2={40} label="R12" highlight={hoverTerm === "r12"} />
        <Resistor x1={230} y1={40} x2={230} y2={150} label="R2" highlight={hoverTerm === "r2"} />
        <Resistor x1={230} y1={40} x2={360} y2={40} label="R23" highlight={hoverTerm === "r23"} />
        <Resistor x1={360} y1={40} x2={360} y2={150} label="R3" highlight={hoverTerm === "r3"} />
        <line x1={40} y1={150} x2={360} y2={150} className="stroke-wire" strokeWidth={2} />
        <Ground x={200} y={150} />
        <NodeDot x={100} y={40} label="V₁" voltage={v("n1")} highlight={selected === "n1"} onClick={() => onSelect("n1")} />
        <NodeDot x={230} y={40} label="V₂" voltage={v("n2")} highlight={selected === "n2"} onClick={() => onSelect("n2")} />
        <NodeDot x={360} y={40} label="V₃" voltage={v("n3")} highlight={selected === "n3"} onClick={() => onSelect("n3")} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 260" className="h-auto w-full">
      <VoltageSource cx={60} cy={50} plusToward="up" label="Vs" value={formatVolts(Vs)} />
      <line x1={60} y1={66} x2={60} y2={40} className="stroke-wire" strokeWidth={2} />
      <line x1={60} y1={40} x2={160} y2={40} className="stroke-wire" strokeWidth={2} />
      <Resistor x1={160} y1={40} x2={280} y2={40} label={`R1 ${formatOhms(R1)}`} highlight={hoverTerm === "r1"} />
      <Resistor x1={280} y1={40} x2={280} y2={140} label={`R2 ${formatOhms(R2)}`} highlight={hoverTerm === "r2"} />
      {preset === "one" && (
        <Resistor x1={200} y1={40} x2={200} y2={140} label={`R3 ${formatOhms(R3)}`} highlight={hoverTerm === "r3"} />
      )}
      <line x1={60} y1={140} x2={280} y2={140} className="stroke-wire" strokeWidth={2} />
      <line x1={60} y1={66} x2={60} y2={140} className="stroke-wire" strokeWidth={2} />
      <Ground x={160} y={140} />
      <NodeDot x={60} y={40} label="Vs" voltage={v("vs")} />
      <NodeDot
        x={280}
        y={40}
        label="V₁"
        voltage={v("n1")}
        highlight={selected === "n1"}
        onClick={() => onSelect("n1")}
      />
    </svg>
  );
}
