"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CurrentParticles } from "@/components/circuit/CurrentParticles";
import { Ground, NodeDot, Resistor, VoltageSource } from "@/components/circuit/primitives";
import { CauseEffect } from "@/components/ui/CauseEffect";
import { Equation } from "@/components/ui/Equation";
import { Readout } from "@/components/ui/Readout";
import { SliderControl } from "@/components/ui/SliderControl";
import { Toggle } from "@/components/ui/Toggle";
import { WhyPanel } from "@/components/ui/WhyPanel";
import { formatOhms, formatVolts } from "@/lib/physics/format";
import { sensorFromLight, wheatstoneCurve, wheatstoneSensor } from "@/lib/physics/wheatstone";

export function WheatstoneSensorSim() {
  const [V0, setV0] = useState(10);
  const [R, setR] = useState(1000);
  const [dR, setDR] = useState(0);
  const [lightMode, setLightMode] = useState(false);
  const [light, setLight] = useState(0.2);

  const effectiveDR = lightMode ? sensorFromLight(R, light) - R : dR;
  const result = useMemo(() => wheatstoneSensor(V0, R, effectiveDR), [V0, R, effectiveDR]);
  const curve = useMemo(() => wheatstoneCurve(V0, R), [V0, R]);
  const balanced = Math.abs(effectiveDR) < 1e-6 * R;
  const iLeft = (V0 / 2) / R;
  const iRight = V0 / (2 * R + effectiveDR);

  return (
    <div className="space-y-6">
      <CauseEffect
        text={
          balanced
            ? "ΔR = 0, so both mid-nodes sit at V0/2. The bridge is balanced and Vout is exactly zero."
            : `The sensor is now ${formatOhms(R + effectiveDR)}. V2 moves while V1 stays at ${formatVolts(result.V1)}, so Vout = ${formatVolts(result.Vout)}.`
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-line bg-panel p-4 notebook-grid">
          <svg viewBox="0 0 420 320" className="h-auto w-full">
            <line x1={210} y1={28} x2={210} y2={56} className="stroke-wire" strokeWidth={2} />
            <VoltageSource cx={210} cy={28} plusToward="down" label="V0" value={formatVolts(V0)} />
            <line x1={80} y1={56} x2={340} y2={56} className="stroke-wire" strokeWidth={2} />
            <line x1={80} y1={56} x2={80} y2={92} className="stroke-wire" strokeWidth={2} />
            <line x1={340} y1={56} x2={340} y2={92} className="stroke-wire" strokeWidth={2} />
            <Resistor x1={80} y1={92} x2={80} y2={160} label="R" />
            <Resistor x1={340} y1={92} x2={340} y2={160} label="R" />
            <line x1={80} y1={160} x2={80} y2={188} className="stroke-wire" strokeWidth={2} />
            <line x1={340} y1={160} x2={340} y2={188} className="stroke-wire" strokeWidth={2} />
            <Resistor x1={80} y1={188} x2={80} y2={256} label="R" />
            <Resistor
              x1={340}
              y1={188}
              x2={340}
              y2={256}
              label={lightMode ? "LDR" : "R+ΔR"}
              highlight={!balanced}
            />
            <line x1={80} y1={256} x2={340} y2={256} className="stroke-wire" strokeWidth={2} />
            <Ground x={210} y={256} />
            <line
              x1={80}
              y1={174}
              x2={340}
              y2={174}
              className={balanced ? "stroke-success" : "stroke-crimson"}
              strokeWidth={1.4}
              strokeDasharray="4 4"
            />
            <NodeDot x={80} y={174} label="V1" voltage={formatVolts(result.V1)} highlight={balanced} />
            <NodeDot
              x={340}
              y={174}
              label="V2"
              voltage={formatVolts(result.V2)}
              highlight={balanced}
            />
            <CurrentParticles pathId="ws-l" d="M80 56 V256" current={iLeft} />
            <CurrentParticles pathId="ws-r" d="M340 56 V256" current={iRight} />
            {balanced && (
              <text x={150} y={300} className="fill-success font-mono text-[13px]">
                BALANCED · V1 = V2 · Vout = 0
              </text>
            )}
          </svg>
        </div>

        <div className="space-y-4 border border-line bg-panel p-5">
          <SliderControl
            label="Supply V0"
            value={V0}
            min={1}
            max={20}
            step={0.1}
            display={formatVolts(V0)}
            onChange={setV0}
          />
          <SliderControl
            label="Arm resistance R"
            value={R}
            min={200}
            max={8000}
            step={50}
            display={formatOhms(R)}
            onChange={setR}
          />
          {!lightMode && (
            <SliderControl
              label="Sensor change ΔR"
              value={dR}
              min={-0.8 * R}
              max={0.8 * R}
              step={10}
              display={formatOhms(dR)}
              onChange={setDR}
            />
          )}
          <Toggle label="Light-level mode (photoresistor)" checked={lightMode} onChange={setLightMode} />
          {lightMode && (
            <SliderControl
              label="Light level"
              value={light}
              min={0}
              max={1}
              step={0.01}
              display={`${Math.round(light * 100)}%`}
              onChange={setLight}
            />
          )}
          <div className="grid grid-cols-2 gap-2">
            <Readout label="V1" value={formatVolts(result.V1)} />
            <Readout label="V2" value={formatVolts(result.V2)} />
            <Readout label="Vout = V2 − V1" value={formatVolts(result.Vout)} emphasize />
            <Readout label="Linear approx" value={formatVolts(result.approx)} />
          </div>
        </div>
      </div>

      <div className="border border-line bg-panel p-5">
        <p className="text-sm text-muted">
          Exact Vout versus the small-signal line Vout ≈ (V0/4)(ΔR/R). They kiss near the origin
          and peel apart as the sensor swing grows.
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#d4cbb8" strokeDasharray="3 3" />
              <XAxis
                dataKey="ratio"
                tick={{ fill: "#687078", fontSize: 11 }}
                label={{ value: "ΔR / R", position: "insideBottom", offset: -4, fill: "#687078" }}
              />
              <YAxis tick={{ fill: "#687078", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#f8f4ec", border: "1px solid #d4cbb8" }}
                formatter={(value) => (typeof value === "number" ? formatVolts(value) : "")}
              />
              <Legend />
              <Line type="monotone" dataKey="exact" name="Exact" stroke="#183153" dot={false} strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="approx"
                name="Small-signal"
                stroke="#A94848"
                dot={false}
                strokeDasharray="5 4"
              />
              <ReferenceDot x={result.ratio} y={result.Vout} r={4} fill="#A94848" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2 text-sm leading-6">
        <Equation display math="V_1 = V_0/2" />
        <Equation display math="V_2 = V_0(R+\Delta R)/(2R+\Delta R)" />
        <Equation display math="V_\mathrm{out}=V_2-V_1" />
        <Equation display math="V_\mathrm{out}\approx (V_0/4)(\Delta R/R)\quad(\Delta R\ll R)" />
      </div>

      <WhyPanel>
        <p>
          The left divider never hears about the sensor, so V1 is stuck at half the supply. The
          right divider does hear about it: a larger ΔR lifts V2. Subtract the two mid-node
          voltages and you have a signal that is zero only when the arms match.
        </p>
        <p>
          The linear formula is a tangent line at ΔR = 0. Far from balance the exact divider is
          curved — that is the graph peeling away from the dashed line.
        </p>
      </WhyPanel>
    </div>
  );
}
