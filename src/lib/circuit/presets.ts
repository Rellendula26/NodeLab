import { syncIdCounter } from "./ids";
import type { Circuit } from "./types";

function collectIds(circuit: Circuit): string[] {
  return [
    ...circuit.junctions.map((junction) => junction.id),
    ...circuit.wires.map((wire) => wire.id),
    ...circuit.elements.map((element) => element.id),
  ];
}

function withIds(circuit: Circuit): Circuit {
  syncIdCounter(collectIds(circuit));
  return circuit;
}

/** Three resistors in a line — the first click should feel obvious. */
export const SERIES_CHAIN: Circuit = withIds({
  junctions: [
    { id: "j_1", x: 140, y: 200 },
    { id: "j_2", x: 300, y: 200 },
    { id: "j_3", x: 460, y: 200 },
    { id: "j_4", x: 620, y: 200 },
  ],
  wires: [],
  elements: [
    {
      id: "e_1",
      type: "resistor",
      label: "R1",
      terminals: ["j_1", "j_2"],
      value: 1000,
      plusTerminal: "j_1",
      currentFrom: "j_1",
      currentTo: "j_2",
    },
    {
      id: "e_2",
      type: "resistor",
      label: "R2",
      terminals: ["j_2", "j_3"],
      value: 2000,
      plusTerminal: "j_2",
      currentFrom: "j_2",
      currentTo: "j_3",
    },
    {
      id: "e_3",
      type: "resistor",
      label: "R3",
      terminals: ["j_3", "j_4"],
      value: 3000,
      plusTerminal: "j_3",
      currentFrom: "j_3",
      currentTo: "j_4",
    },
    { id: "e_4", type: "ground", label: "GND", terminals: ["j_1"] },
  ],
});

/**
 * Intentionally misleading geometry:
 * - R1 and R2 are parallel but drawn far apart
 * - R3 and R4 look stacked in series, but R5 branches from the middle
 * - two grounds sit on the same bottom rail
 */
export const LOOKS_CAN_LIE: Circuit = withIds({
  junctions: [
    { id: "j_10", x: 90, y: 90 },
    { id: "j_11", x: 250, y: 90 },
    { id: "j_12", x: 420, y: 90 },
    { id: "j_13", x: 680, y: 90 },
    { id: "j_20", x: 90, y: 300 },
    { id: "j_21", x: 250, y: 300 },
    { id: "j_22", x: 420, y: 300 },
    { id: "j_23", x: 680, y: 300 },
    { id: "j_30", x: 420, y: 195 },
    { id: "j_31", x: 560, y: 195 },
    { id: "j_32", x: 680, y: 380 },
  ],
  wires: [
    { id: "w_1", from: "j_10", to: "j_11" },
    { id: "w_2", from: "j_11", to: "j_12" },
    { id: "w_3", from: "j_12", to: "j_13" },
    { id: "w_4", from: "j_20", to: "j_21" },
    { id: "w_5", from: "j_21", to: "j_22" },
    { id: "w_6", from: "j_22", to: "j_23" },
    { id: "w_7", from: "j_23", to: "j_32" },
  ],
  elements: [
    {
      id: "e_10",
      type: "resistor",
      label: "R1",
      terminals: ["j_11", "j_21"],
      value: 1000,
      plusTerminal: "j_11",
      currentFrom: "j_11",
      currentTo: "j_21",
    },
    {
      id: "e_11",
      type: "resistor",
      label: "R2",
      terminals: ["j_13", "j_23"],
      value: 1000,
      plusTerminal: "j_13",
      currentFrom: "j_13",
      currentTo: "j_23",
    },
    {
      id: "e_12",
      type: "resistor",
      label: "R3",
      terminals: ["j_12", "j_30"],
      value: 2200,
      plusTerminal: "j_12",
      currentFrom: "j_12",
      currentTo: "j_30",
    },
    {
      id: "e_13",
      type: "resistor",
      label: "R4",
      terminals: ["j_30", "j_22"],
      value: 2200,
      plusTerminal: "j_30",
      currentFrom: "j_30",
      currentTo: "j_22",
    },
    {
      id: "e_14",
      type: "resistor",
      label: "R5",
      terminals: ["j_30", "j_31"],
      value: 4700,
      plusTerminal: "j_30",
      currentFrom: "j_30",
      currentTo: "j_31",
    },
    { id: "e_15", type: "ground", label: "GND", terminals: ["j_20"] },
    { id: "e_16", type: "ground", label: "GND", terminals: ["j_32"] },
  ],
});

export const PRESETS = [
  {
    id: "looks-can-lie",
    name: "Looks can lie",
    blurb: "Far-apart parallels, a fake series pair, and two grounds.",
    circuit: LOOKS_CAN_LIE,
  },
  {
    id: "series-chain",
    name: "Simple chain",
    blurb: "Three resistors, four nodes. Click any wire or dot.",
    circuit: SERIES_CHAIN,
  },
] as const;

export const DEFAULT_CIRCUIT = LOOKS_CAN_LIE;
