"use client";

import { useMemo, useState } from "react";
import { CurrentParticles } from "@/components/circuit/CurrentParticles";
import { Ground, NodeDot, Resistor } from "@/components/circuit/primitives";
import { CauseEffect } from "@/components/ui/CauseEffect";
import { Equation } from "@/components/ui/Equation";
import { Readout } from "@/components/ui/Readout";
import { SliderControl } from "@/components/ui/SliderControl";
import { WhyPanel } from "@/components/ui/WhyPanel";
import { formatAmps, formatOhms, formatVolts } from "@/lib/physics/format";
import { elementBranch } from "@/lib/physics/elementVoltage";

export function ElementVoltageSim() {
  const [V1, setV1] = useState(8);
  const [V2, setV2] = useState(3);
  const [R, setR] = useState(2000);
  const [ground, setGround] = useState(0);

  const result = useMemo(() => elementBranch(V1, V2, R, ground), [V1, V2, R, ground]);
  const reversed = result.current < 0;
  const idle = Math.abs(result.current) < 1e-9;
  const h1 = 220 - result.displayV1 * 10;
  const h2 = 220 - result.displayV2 * 10;

  return (
    <div className="space-y-6">
      <CauseEffect
        text={
          idle
            ? "V1 = V2, so there is no drop across the resistor and the current particles stop."
            : ground === 0
              ? `Current ${reversed ? "runs right to left" : "runs left to right"} because ${formatVolts(V1)} is ${reversed ? "below" : "above"} ${formatVolts(V2)}.`
              : `Ground moved to ${formatVolts(ground)}. The labels changed to ${formatVolts(result.displayV1)} and ${formatVolts(result.displayV2)}, but VR and I did not.`
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-line bg-panel p-4 notebook-grid">
          <svg viewBox="0 0 480 280" className="h-auto w-full">
            <rect x={70} y={h1} width={16} height={Math.max(4, 220 - h1)} className="fill-steel/35" />
            <rect x={394} y={h2} width={16} height={Math.max(4, 220 - h2)} className="fill-crimson/30" />
            <line x1={40} y1={220} x2={440} y2={220} className="stroke-line" strokeWidth={1} />
            <Resistor x1={110} y1={120} x2={370} y2={120} label={`R = ${formatOhms(R)}`} />
            <NodeDot
              x={86}
              y={120}
              label="V1"
              voltage={formatVolts(result.displayV1)}
            />
            <NodeDot
              x={394}
              y={120}
              label="V2"
              voltage={formatVolts(result.displayV2)}
            />
            <CurrentParticles pathId="elem-i" d="M86 120 H394" current={result.current} />
            <Ground x={240} y={220} />
            <text x={20} y={36} className="fill-muted font-mono text-[11px]">
              bar height = displayed node voltage
            </text>
            <text x={150} y={260} className="fill-navy font-mono text-[12px]">
              {idle
                ? "I = 0"
                : reversed
                  ? "conventional current ←"
                  : "conventional current →"}
            </text>
          </svg>
        </div>

        <div className="space-y-4 border border-line bg-panel p-5">
          <SliderControl
            label="Absolute V1"
            value={V1}
            min={-5}
            max={15}
            step={0.1}
            display={formatVolts(V1)}
            onChange={setV1}
          />
          <SliderControl
            label="Absolute V2"
            value={V2}
            min={-5}
            max={15}
            step={0.1}
            display={formatVolts(V2)}
            onChange={setV2}
          />
          <SliderControl
            label="Resistance"
            value={R}
            min={200}
            max={8000}
            step={50}
            display={formatOhms(R)}
            onChange={setR}
          />
          <SliderControl
            label="Ground reference (sea level)"
            value={ground}
            min={-5}
            max={12}
            step={0.1}
            display={formatVolts(ground)}
            onChange={setGround}
          />
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Displayed V1" value={formatVolts(result.displayV1)} />
            <Readout label="Displayed V2" value={formatVolts(result.displayV2)} />
            <Readout label="VR = V1 − V2" value={formatVolts(result.VR)} emphasize />
            <Readout label="I = VR / R" value={formatAmps(result.current)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-sm leading-6">
        <div className="border border-line bg-panel p-4">
          <p className="font-medium text-navy">Node voltages</p>
          <p className="mt-2 text-muted">
            Absolute potentials relative to whatever we called zero. Move ground and these numbers
            slide together.
          </p>
        </div>
        <div className="border border-line bg-panel p-4">
          <p className="font-medium text-navy">Element voltage</p>
          <p className="mt-2 text-muted">
            Only the difference across the resistor. That difference — and the current it drives —
            cannot see the ground choice.
          </p>
        </div>
      </div>

      <Equation display math="V_R = V_{(+)}-V_{(-)} = V_1-V_2,\quad I=V_R/R" />

      <WhyPanel>
        <p>
          Choosing ground is choosing sea level. The elevation numbers on the map change. The cliff
          height between two towns does not. The resistor is that cliff.
        </p>
      </WhyPanel>
    </div>
  );
}
