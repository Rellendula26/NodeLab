import Link from "next/link";
import { HeroCircuit } from "@/components/catalog/HeroCircuit";
import { SimCard } from "@/components/catalog/SimCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MODULES } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5">
        <section className="grid items-center gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div>
            <p className="text-[12px] tracking-[0.2em] text-steel uppercase">
              Penn Engineering · ESE 2150
            </p>
            <h1 className="mt-3 font-serif text-5xl tracking-tight text-navy md:text-6xl">
              NodeLab
            </h1>
            <p className="mt-3 text-lg text-steel">Circuit Analysis & Node Voltage Lab</p>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              Interactive simulations for building intuition about current, voltage, KCL, KVL,
              Wheatstone bridges, and nodal analysis.
            </p>
          </div>
          <div className="border border-line bg-panel p-4 notebook-grid">
            <HeroCircuit />
            <p className="mt-2 text-center font-mono text-[11px] text-muted">
              Conventional current · particles scale with |I|
            </p>
          </div>
        </section>

        <section className="border border-line bg-panel p-6 md:p-8">
          <p className="text-[11px] tracking-[0.16em] text-crimson uppercase">Shared circuit</p>
          <h2 className="mt-2 font-serif text-3xl text-navy">ESE 2150 Core Concepts Lab</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Five linked tabs. Change a resistor or source once — currents, node voltages, the KCL
            equation, and the supernode all move. This is for tinkering, not for answers.
          </p>
          <Link
            href="/lab"
            className="mt-6 inline-block border border-navy px-4 py-2 text-sm text-navy hover:bg-navy hover:text-bg"
          >
            Open the Lab
          </Link>
        </section>

        <div id="modules" className="mt-16 space-y-14 pb-20">
          {MODULES.map((module) => (
            <section key={module.id}>
              <p className="text-[11px] tracking-[0.16em] text-steel uppercase">
                Module {module.number}
              </p>
              <h2 className="mt-1 font-serif text-3xl text-navy">{module.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{module.blurb}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {module.sims.map((sim) => (
                  <SimCard key={sim.slug} sim={sim} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
