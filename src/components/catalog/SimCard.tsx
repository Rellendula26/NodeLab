import Link from "next/link";
import type { SimulationMeta } from "@/lib/catalog";

export function SimCard({ sim }: { sim: SimulationMeta }) {
  const inner = (
    <article className="flex h-full flex-col border border-line bg-panel p-5">
      <p className="text-[11px] tracking-[0.14em] text-steel uppercase">{sim.eyebrow}</p>
      <h3 className="mt-2 font-serif text-xl leading-snug text-navy">{sim.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{sim.description}</p>
      <p className="mt-5 text-sm text-crimson">
        {sim.status === "ready" ? "Launch Simulation →" : "Coming in a later phase"}
      </p>
    </article>
  );

  if (sim.status !== "ready") {
    return <div className="opacity-70">{inner}</div>;
  }

  return (
    <Link href={`/sim/${sim.slug}`} className="block transition hover:border-navy">
      {inner}
    </Link>
  );
}
