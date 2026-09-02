export type SimStatus = "ready" | "soon";

export interface SimulationMeta {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  module: string;
  status: SimStatus;
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  blurb: string;
  sims: SimulationMeta[];
}

export const SIMULATIONS: SimulationMeta[] = [
  {
    slug: "wheatstone-sensor",
    eyebrow: "Bridge Circuits & Sensors",
    title: "Wheatstone Sensor · Resistance → Voltage",
    description:
      "Unbalance one arm of the bridge and watch a resistance change become a voltage. See when the linear sensor model stops being honest.",
    module: "bridge",
    status: "ready",
  },
  {
    slug: "wheatstone-balance",
    eyebrow: "Bridge Circuits & Sensors",
    title: "Wheatstone Bridge · Find the Balance",
    description:
      "Tune R3 until the mid-nodes sit at the same potential. Balanced does not mean the currents vanished — only the center branch did.",
    module: "bridge",
    status: "soon",
  },
  {
    slug: "same-node",
    eyebrow: "Current, Nodes & KCL",
    title: "Same Node ≠ Same Current",
    description:
      "Watch current split at an extraordinary node while every point on the conductor remains at the same voltage.",
    module: "nodes",
    status: "ready",
  },
  {
    slug: "topology",
    eyebrow: "Current, Nodes & KCL",
    title: "Node · Branch · Loop",
    description:
      "Highlight topology, then rearrange the drawing. Different geometry, same circuit.",
    module: "nodes",
    status: "soon",
  },
  {
    slug: "kcl-split",
    eyebrow: "Current, Nodes & KCL",
    title: "KCL · Where Does the Current Go?",
    description:
      "Assign arrows, enter currents, and watch a negative value flip the physical direction — not the math.",
    module: "nodes",
    status: "soon",
  },
  {
    slug: "long-way",
    eyebrow: "From KVL/KCL to Nodal Analysis",
    title: "Solve It the Long Way",
    description:
      "Build currents, polarities, loops, and Ohm’s law the lecture way — then count how many unknowns you created.",
    module: "kvl",
    status: "soon",
  },
  {
    slug: "element-voltage",
    eyebrow: "From KVL/KCL to Nodal Analysis",
    title: "Voltage Across an Element",
    description:
      "Node voltages are heights above sea level. The resistor only cares about the difference.",
    module: "kvl",
    status: "ready",
  },
  {
    slug: "move-ground",
    eyebrow: "From KVL/KCL to Nodal Analysis",
    title: "Ground Is a Reference, Not a Sink",
    description:
      "Re-zero the circuit. Every node number moves. Every drop and current stays put.",
    module: "kvl",
    status: "soon",
  },
  {
    slug: "nodal-builder",
    eyebrow: "Node Voltage Analysis",
    title: "Nodal Analysis · Build the Equation",
    description:
      "Identify nodes, choose ground, assume currents leave, write KCL, and substitute Ohm’s law — term by term.",
    module: "nodal",
    status: "ready",
  },
  {
    slug: "nodal-inspection",
    eyebrow: "Node Voltage Analysis",
    title: "Nodal by Inspection · See the Matrix",
    description:
      "Hover a conductance-matrix entry and watch the resistors that wrote it light up.",
    module: "nodal",
    status: "soon",
  },
  {
    slug: "current-sources",
    eyebrow: "Node Voltage Analysis",
    title: "Current Sources Make Nodal Easy",
    description:
      "A current source is already a KCL term. Watch it inject charge and sit in the equation without extra work.",
    module: "nodal",
    status: "soon",
  },
  {
    slug: "dependent-source",
    eyebrow: "Dependent Sources",
    title: "Dependent Sources · One Variable Controls Another",
    description:
      "A controlling voltage somewhere else sets the source. Replace it with node voltages and keep writing KCL.",
    module: "dependent",
    status: "soon",
  },
  {
    slug: "supernode",
    eyebrow: "Supernodes",
    title: "Supernode · When a Voltage Source Floats",
    description:
      "The source current is unknown, so wrap both nodes and write KCL once around the boundary.",
    module: "supernode",
    status: "soon",
  },
];

export const MODULES: CourseModule[] = [
  {
    id: "bridge",
    number: 1,
    title: "Bridge Circuits & Sensors",
    blurb: "Balance, unbalance, and turn a resistance change into a voltage.",
    sims: SIMULATIONS.filter((sim) => sim.module === "bridge"),
  },
  {
    id: "nodes",
    number: 2,
    title: "Current, Nodes & KCL",
    blurb: "Same potential is not the same current. Topology, not the drawing, decides.",
    sims: SIMULATIONS.filter((sim) => sim.module === "nodes"),
  },
  {
    id: "kvl",
    number: 3,
    title: "From KVL/KCL to Nodal Analysis",
    blurb: "Element voltage is a difference. Ground is only a choice of zero.",
    sims: SIMULATIONS.filter((sim) => sim.module === "kvl"),
  },
  {
    id: "nodal",
    number: 4,
    title: "Node Voltage Analysis",
    blurb: "Write KCL at the unknown nodes, then let Ohm’s law do the substitution.",
    sims: SIMULATIONS.filter((sim) => sim.module === "nodal"),
  },
  {
    id: "dependent",
    number: 5,
    title: "Dependent Sources",
    blurb: "One voltage or current writes the value of another source.",
    sims: SIMULATIONS.filter((sim) => sim.module === "dependent"),
  },
  {
    id: "supernode",
    number: 6,
    title: "Supernodes",
    blurb: "A floating voltage source is not a dead end. It is a larger KCL boundary.",
    sims: SIMULATIONS.filter((sim) => sim.module === "supernode"),
  },
];

export function getSimulation(slug: string): SimulationMeta | undefined {
  return SIMULATIONS.find((sim) => sim.slug === slug);
}
