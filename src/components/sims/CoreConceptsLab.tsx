"use client";

import { useMemo, useState } from "react";
import { CurrentParticles } from "@/components/circuit/CurrentParticles";
import {
  CurrentSource,
  Ground,
  NodeDot,
  Resistor,
  SupernodeBoundary,
  VoltageSource,
} from "@/components/circuit/primitives";
import { CauseEffect } from "@/components/ui/CauseEffect";
import { Equation } from "@/components/ui/Equation";
import { Readout } from "@/components/ui/Readout";
import { SliderControl } from "@/components/ui/SliderControl";
import { formatAmps, formatOhms, formatVolts } from "@/lib/physics/format";
import { inspectionMatrix, solveNodal } from "@/lib/physics/nodal";
import { twoUnknownNodes } from "@/lib/physics/presets";
import { solveTwoNodeSupernode } from "@/lib/physics/supernode";

const TABS = [
  "1 · Current & Nodes",
  "2 · KCL",
  "3 · Node Voltage",
  "4 · Nodal Equations",
  "5 · Supernode",
];

export function CoreConceptsLab() {
  const [tab, setTab] = useState(0);
  const [R1, setR1] = useState(2000);
  const [R2, setR2] = useState(2000);
  const [R3, setR3] = useState(4000);
  const [Is, setIs] = useState(0.003);
  const [Vs, setVs] = useState(6);
  const [lastChange, setLastChange] = useState("Move a control. This line names the cause, then the effect.");

  const resistive = useMemo(() => twoUnknownNodes(R1, R3, R2, Is), [R1, R2, R3, Is]);
  const solved = useMemo(() => solveNodal(resistive), [resistive]);
  const matrix = useMemo(() => inspectionMatrix(resistive), [resistive]);
  const superSolved = useMemo(() => solveTwoNodeSupernode(R1, R3, Is, Vs), [R1, R3, Is, Vs]);

  const V1 = tab === 4 ? superSolved.V1 : solved.voltages.n1;
  const V2 = tab === 4 ? superSolved.V2 : solved.voltages.n2;
  const I1 = tab === 4 ? superSolved.I1 : V1 / R1;
  const I12 = tab === 4 ? 0 : (V1 - V2) / R2;
  const I3 = tab === 4 ? superSolved.I3 : V2 / R3;

  function note(text: string) {
    setLastChange(text);
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-[11px] tracking-[0.18em] text-crimson uppercase">Shared circuit</p>
        <h1 className="mt-2 font-serif text-4xl text-navy">ESE 2150 Core Concepts Lab</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Tinker. Every slider is a cause. The diagram is the effect. The line below names the
          physics in between.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SliderControl
            label="R1 (V₁ to ground)"
            value={R1}
            min={500}
            max={8000}
            step={50}
            display={formatOhms(R1)}
            onChange={(value) => {
              setR1(value);
              note(`R1 is now ${formatOhms(value)}. Current leaving V₁ through that branch changes, so V₁ moves until KCL balances again.`);
            }}
          />
          <SliderControl
            label="R12 (between nodes)"
            value={R2}
            min={500}
            max={8000}
            step={50}
            display={formatOhms(R2)}
            onChange={(value) => {
              setR2(value);
              note(`The bridge resistor is now ${formatOhms(value)}. Less current can sneak from V₁ to V₂, so the two node voltages pull apart.`);
            }}
          />
          <SliderControl
            label="R3 (V₂ to ground)"
            value={R3}
            min={500}
            max={8000}
            step={50}
            display={formatOhms(R3)}
            onChange={(value) => {
              setR3(value);
              note(`R3 is now ${formatOhms(value)}. Current leaving V₂ shrinks, so V₂ climbs.`);
            }}
          />
          <SliderControl
            label="Current source Is"
            value={Is * 1000}
            min={0.5}
            max={8}
            step={0.1}
            display={formatAmps(Is)}
            onChange={(value) => {
              setIs(value / 1000);
              note(`Is is now ${formatAmps(value / 1000)}. More charge is injected into V₁, so both node voltages lift.`);
            }}
          />
        </div>

        <div className="mt-6">
          <CauseEffect text={lastChange} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(index)}
              className={`border px-3 py-1.5 text-sm ${
                tab === index ? "border-navy bg-navy text-bg" : "border-line text-steel"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border border-line bg-panel p-4 notebook-grid">
            <svg viewBox="0 0 440 260" className="h-auto w-full">
              {tab === 4 && <SupernodeBoundary x={48} y={18} width={280} height={90} />}
              <CurrentSource cx={70} cy={100} pointing="up" label={`Is ${formatAmps(Is)}`} />
              <line x1={70} y1={40} x2={150} y2={40} className="stroke-wire" strokeWidth={2} />
              <Resistor x1={150} y1={40} x2={150} y2={170} label={`R1 ${formatOhms(R1)}`} />
              {tab === 4 ? (
                <>
                  <line x1={150} y1={40} x2={210} y2={40} className="stroke-wire" strokeWidth={2} />
                  <VoltageSource cx={240} cy={40} plusToward="right" label="Vs" value={formatVolts(Vs)} />
                  <line x1={270} y1={40} x2={330} y2={40} className="stroke-wire" strokeWidth={2} />
                </>
              ) : (
                <Resistor x1={150} y1={40} x2={330} y2={40} label={`R12 ${formatOhms(R2)}`} />
              )}
              <Resistor x1={330} y1={40} x2={330} y2={170} label={`R3 ${formatOhms(R3)}`} />
              <line x1={70} y1={170} x2={330} y2={170} className="stroke-wire" strokeWidth={2} />
              <line x1={70} y1={116} x2={70} y2={170} className="stroke-wire" strokeWidth={2} />
              <Ground x={200} y={170} />
              <NodeDot x={150} y={40} label="V₁" voltage={formatVolts(V1)} />
              <NodeDot x={330} y={40} label="V₂" voltage={formatVolts(V2)} />
              <CurrentParticles pathId="core-r1" d="M150 40 V170" current={I1} />
              {tab !== 4 && <CurrentParticles pathId="core-r12" d="M150 40 H330" current={I12} />}
              <CurrentParticles pathId="core-r3" d="M330 40 V170" current={I3} />
              {tab === 4 && (
                <text x={150} y={230} className="fill-steel font-mono text-[12px]">
                  SUPERNODE · V₂ − V₁ = {formatVolts(Vs)}
                </text>
              )}
            </svg>
          </div>

          <div className="space-y-4 border border-line bg-panel p-5">
            {tab === 0 && (
              <>
                <p className="text-sm leading-6">
                  Particles are conventional current. Speed tracks |I|. Both nodes are single
                  conductors — one voltage each — even while their branch currents disagree.
                </p>
                <Readout label="I through R1" value={formatAmps(I1)} />
                <Readout label="I through R12" value={formatAmps(I12)} />
                <Readout label="I through R3" value={formatAmps(I3)} />
              </>
            )}
            {tab === 1 && (
              <>
                <p className="text-sm leading-6">
                  Charge cannot accumulate at V₁. Whatever Is injects must leave through R1 and R12.
                </p>
                <Equation display math="I_s = I_{R1} + I_{R12}" />
                <Readout
                  label="KCL residual at V₁"
                  value={formatAmps(Is - I1 - I12)}
                  emphasize
                />
              </>
            )}
            {tab === 2 && (
              <>
                <p className="text-sm leading-6">
                  Replace each current with a voltage difference over a resistance. The node
                  voltages are the unknowns.
                </p>
                <Equation display math="I_{R1}=(V_1-0)/R_1" />
                <Equation display math="I_{R12}=(V_1-V_2)/R_{12}" />
                <Readout label="V₁" value={formatVolts(V1)} emphasize />
                <Readout label="V₂" value={formatVolts(V2)} />
              </>
            )}
            {tab === 3 && (
              <>
                <p className="text-sm leading-6">The same KCL, assembled as G V = I.</p>
                <div className="font-mono text-sm">
                  {matrix.G.map((row, i) => (
                    <div key={matrix.labels[i]}>
                      {matrix.labels[i]}: {row.map((value) => value.toExponential(2)).join("   ")}
                    </div>
                  ))}
                </div>
                <Readout label="V₁" value={formatVolts(V1)} />
                <Readout label="V₂" value={formatVolts(V2)} />
              </>
            )}
            {tab === 4 && (
              <>
                <SliderControl
                  label="Floating source Vs = V₂ − V₁"
                  value={Vs}
                  min={0}
                  max={12}
                  step={0.1}
                  display={formatVolts(Vs)}
                  onChange={(value) => {
                    setVs(value);
                    note(`The floating source is now ${formatVolts(value)}. We know the voltage between the nodes, not the current through the source — that is why the supernode exists.`);
                  }}
                />
                <p className="text-sm leading-6">
                  The source current is unknown, so we stop writing KCL at each node and write it
                  once around both.
                </p>
                <Equation display math="V_2-V_1=V_s" />
                <Equation display math="I_s = V_1/R_1 + V_2/R_3" />
                <Readout label="V₁" value={formatVolts(V1)} />
                <Readout label="V₂" value={formatVolts(V2)} emphasize />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
