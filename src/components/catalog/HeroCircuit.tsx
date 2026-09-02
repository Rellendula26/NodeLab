"use client";

import { CurrentParticles } from "@/components/circuit/CurrentParticles";
import { Ground, NodeDot, Resistor } from "@/components/circuit/primitives";

export function HeroCircuit() {
  return (
    <svg viewBox="0 0 280 160" className="h-40 w-full max-w-sm" aria-hidden>
      <line x1={40} y1={36} x2={240} y2={36} className="stroke-wire" strokeWidth={2} />
      <line x1={40} y1={36} x2={40} y2={70} className="stroke-wire" strokeWidth={2} />
      <line x1={240} y1={36} x2={240} y2={70} className="stroke-wire" strokeWidth={2} />
      <Resistor x1={40} y1={70} x2={40} y2={118} label="R" />
      <Resistor x1={240} y1={70} x2={240} y2={118} label="R" />
      <line x1={40} y1={118} x2={240} y2={118} className="stroke-wire" strokeWidth={2} />
      <Ground x={140} y={118} />
      <NodeDot x={40} y={36} label="V₁" />
      <NodeDot x={240} y={36} label="V₂" />
      <CurrentParticles pathId="hero-left" d="M40 36 V118" current={0.8} />
      <CurrentParticles pathId="hero-right" d="M240 36 V118" current={0.8} />
      <CurrentParticles pathId="hero-top" d="M40 36 H240" current={0.35} />
    </svg>
  );
}
