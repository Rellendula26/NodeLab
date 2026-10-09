# NodeLab

An interactive circuit-learning site built with Next.js, React, and TypeScript. It connects circuit diagrams to node voltages, branch currents, Kirchhoff's current law, and nodal-analysis equations.

## Run locally

Use Node.js and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

```bash
npm run test
npm run lint
npm run build
npm run start
```

`start` serves a completed production build. The test command runs Vitest.

## Explore

- `/`: simulation catalog.
- `/sim/same-node`: same voltage does not mean the same current.
- `/sim/wheatstone-sensor`: bridge resistance changes and output voltage.
- `/sim/element-voltage`: voltage across an element and reference polarity.
- `/sim/nodal-builder`: nodal-analysis practice.
- `/lab` and `/workspace`: circuit-building interfaces.

The circuit model supports resistors, voltage sources, current sources, and ground. Other catalog cards may show a "not wired yet" placeholder instead of a working simulation.

## Code map

- `src/components/sims/`: interactive demonstrations.
- `src/components/workspace/`: circuit canvas and symbols.
- `src/lib/circuit/`: graph structure, topology, mutations, and analysis.
- `src/lib/physics/`: nodal/supernode solvers and teaching calculations.
- `src/lib/catalog.ts`: catalog metadata.

KaTeX displays equations, Recharts displays plots, and Framer Motion handles animation. Tests cover selected Wheatstone, nodal, and supernode calculations.

## Limits

This is an educational circuit model, not a SPICE replacement. It does not provide a general transient or semiconductor-device solver. Not every catalog entry is implemented. The commands above are taken from the checked-in configuration; their results were not rerun for this documentation update.
