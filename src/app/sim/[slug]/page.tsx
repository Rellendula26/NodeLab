import { notFound } from "next/navigation";
import { SimFrame } from "@/components/layout/SimFrame";
import { ElementVoltageSim } from "@/components/sims/ElementVoltageSim";
import { NodalBuilderSim } from "@/components/sims/NodalBuilderSim";
import { SameNodeSim } from "@/components/sims/SameNodeSim";
import { WheatstoneSensorSim } from "@/components/sims/WheatstoneSensorSim";
import { SIMULATIONS, getSimulation } from "@/lib/catalog";

const READY: Record<string, React.ComponentType> = {
  "same-node": SameNodeSim,
  "wheatstone-sensor": WheatstoneSensorSim,
  "element-voltage": ElementVoltageSim,
  "nodal-builder": NodalBuilderSim,
};

export function generateStaticParams() {
  return SIMULATIONS.map((sim) => ({ slug: sim.slug }));
}

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getSimulation(slug);
  if (!meta) notFound();

  const Sim = READY[slug];

  return (
    <SimFrame eyebrow={meta.eyebrow} title={meta.title} lede={meta.description}>
      {Sim ? (
        <Sim />
      ) : (
        <div className="border border-line bg-panel p-8">
          <p className="font-serif text-2xl text-navy">This board is drawn, not wired yet.</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Phase 2 ships four live simulations. This card is in the catalog so the lecture map is
            complete; the solver and diagram land in a later phase.
          </p>
        </div>
      )}
    </SimFrame>
  );
}
