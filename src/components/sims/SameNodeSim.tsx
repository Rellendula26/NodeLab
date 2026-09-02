"use client";

import { useMemo, useState } from "react";
import { CurrentParticles } from "@/components/circuit/CurrentParticles";
import { NodeDot, Resistor } from "@/components/circuit/primitives";
import { CauseEffect } from "@/components/ui/CauseEffect";
import { Equation } from "@/components/ui/Equation";
import { Readout } from "@/components/ui/Readout";
import { SliderControl } from "@/components/ui/SliderControl";
import { WhyPanel } from "@/components/ui/WhyPanel";
import { formatAmps, formatVolts } from "@/lib/physics/format";
import { splitTwoWays } from "@/lib/physics/kcl";

export function SameNodeSim() {
  const [incoming, setIncoming] = useState(5);
  const [percentRight, setPercentRight] = useState(60);
  const [hoverNode, setHoverNode] = useState(false);
  const split = useMemo(
    () => splitTwoWays(incoming, percentRight / 100),
    [incoming, percentRight],
  );

  return (
    <div className="space-y-6">
      <CauseEffect
        text={`${formatAmps(incoming)} arrives at the node. ${percentRight}% of that charge continues right (${formatAmps(split.right)}), the rest turns upward (${formatAmps(split.up)}). The conductor itself stays at one voltage.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-line bg-panel p-4 notebook-grid">
          <svg viewBox="0 0 460 240" className="h-auto w-full">
            <line
              x1={40}
              y1={130}
              x2={230}
              y2={130}
              className={hoverNode ? "stroke-crimson" : "stroke-wire"}
              strokeWidth={hoverNode ? 8 : 2.2}
              onMouseEnter={() => setHoverNode(true)}
              onMouseLeave={() => setHoverNode(false)}
            />
            <line
              x1={230}
              y1={130}
              x2={410}
              y2={130}
              className={hoverNode ? "stroke-crimson" : "stroke-wire"}
              strokeWidth={hoverNode ? 8 : 2.2}
              onMouseEnter={() => setHoverNode(true)}
              onMouseLeave={() => setHoverNode(false)}
            />
            <line
              x1={230}
              y1={40}
              x2={230}
              y2={130}
              className={hoverNode ? "stroke-crimson" : "stroke-wire"}
              strokeWidth={hoverNode ? 8 : 2.2}
              onMouseEnter={() => setHoverNode(true)}
              onMouseLeave={() => setHoverNode(false)}
            />
            <CurrentParticles pathId="node-in" d="M40 130 H230" current={split.incoming} />
            <CurrentParticles pathId="node-right" d="M230 130 H410" current={split.right} />
            <CurrentParticles pathId="node-up" d="M230 130 V40" current={-split.up} />
            <NodeDot x={230} y={130} highlight={hoverNode} />
            <text x={48} y={118} className="fill-navy font-mono text-[12px]">
              I₁ = {formatAmps(split.incoming)}
            </text>
            <text x={300} y={118} className="fill-navy font-mono text-[12px]">
              I₂ = {formatAmps(split.right)}
            </text>
            <text x={242} y={70} className="fill-navy font-mono text-[12px]">
              I₃ = {formatAmps(split.up)}
            </text>
            <text x={150} y={210} className="fill-muted font-mono text-[11px]">
              Hover the wires — they are one node.
            </text>
          </svg>
        </div>

        <div className="space-y-5 border border-line bg-panel p-5">
          <SliderControl
            label="Incoming current I₁"
            value={incoming}
            min={0.5}
            max={10}
            step={0.1}
            display={formatAmps(incoming)}
            onChange={setIncoming}
          />
          <SliderControl
            label="Percent leaving to the right"
            value={percentRight}
            min={0}
            max={100}
            step={1}
            display={`${percentRight}%`}
            onChange={setPercentRight}
          />
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Node voltage" value={formatVolts(4)} />
            <Readout label="KCL" value="I₁ = I₂ + I₃" emphasize />
          </div>
          <p className="text-sm leading-6 text-muted">
            Every point on this conductor is at 4.0 V. The currents are a bookkeeping of charge
            leaving through different exits — not a property of the node itself.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-line bg-panel p-5">
          <p className="text-[11px] tracking-[0.14em] text-crimson uppercase">Extraordinary node</p>
          <h3 className="mt-1 font-serif text-xl">Current can split</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Same voltage, different branch currents. Charge cannot pile up, so the outgoing branches
            together carry whatever arrived.
          </p>
        </div>
        <div className="border border-line bg-panel p-5">
          <p className="text-[11px] tracking-[0.14em] text-steel uppercase">Series connection</p>
          <h3 className="mt-1 font-serif text-xl">Nowhere else to go</h3>
          <svg viewBox="0 0 360 90" className="mt-3 w-full">
            <Resistor x1={30} y1={40} x2={150} y2={40} label="2 Ω" />
            <Resistor x1={210} y1={40} x2={330} y2={40} label="4 Ω" />
            <line x1={150} y1={40} x2={210} y2={40} className="stroke-wire" strokeWidth={2} />
            <NodeDot x={180} y={40} label="a" />
            <CurrentParticles pathId="series" d="M30 40 H330" current={1.2} />
          </svg>
          <p className="mt-2 font-mono text-sm text-navy">I_left = I_right</p>
        </div>
      </div>

      <div className="border border-navy bg-navy px-5 py-4 text-bg">
        <p className="font-serif text-xl">Same node → same voltage</p>
        <p className="mt-1 font-serif text-xl">Same series branch → same current</p>
      </div>

      <WhyPanel title="Why doesn’t the current stay the same?">
        <p>
          A node is an ideal conductor. An ideal conductor cannot hold a voltage difference, so
          every attached wire is at the same potential. Current is the flow through a particular
          exit. If there are three exits, there can be three different currents.
        </p>
        <Equation display math="I_1 = I_2 + I_3" />
        <p>
          At point a on the series pair there is no third wire. Every coulomb that leaves the 2 Ω
          resistor must enter the 4 Ω resistor.
        </p>
      </WhyPanel>
    </div>
  );
}
