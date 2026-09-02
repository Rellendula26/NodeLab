import { describe, expect, it } from "vitest";
import { algebraicKCL, splitTwoWays } from "./kcl";
import { elementBranch } from "./elementVoltage";
import {
  currentSourceNode,
  groundedVoltageSource,
  oneUnknownNode,
  twoUnknownNodes,
} from "./presets";
import { solveNodal } from "./nodal";

describe("KCL split", () => {
  it("conserves current at an extraordinary node", () => {
    const split = splitTwoWays(5, 0.6);
    expect(split.right + split.up).toBeCloseTo(5);
    expect(split.residual).toBeCloseTo(0);
  });

  it("treats ΣI = 0 with leaving-positive convention", () => {
    const result = algebraicKCL([
      { amps: 5, leaving: false },
      { amps: 3, leaving: true },
      { amps: 2, leaving: true },
    ]);
    expect(result.balanced).toBe(true);
  });
});

describe("element voltage", () => {
  it("keeps VR and I when ground shifts", () => {
    const before = elementBranch(8, 3, 1000, 0);
    const after = elementBranch(8, 3, 1000, 8);
    expect(after.displayV1).toBeCloseTo(0);
    expect(after.displayV2).toBeCloseTo(-5);
    expect(after.VR).toBeCloseTo(before.VR);
    expect(after.current).toBeCloseTo(before.current);
  });
});

describe("nodal solver", () => {
  it("solves one unknown node by inspection", () => {
    const solved = solveNodal(oneUnknownNode(2000, 4000, 6000, 12));
    const g = 1 / 2000 + 1 / 4000 + 1 / 6000;
    expect(solved.voltages.n1).toBeCloseTo(12 * (1 / 2000) / g);
  });

  it("solves a two-node current-driven network", () => {
    const solved = solveNodal(twoUnknownNodes(1000, 4000, 2000, 0.003));
    const v1 = solved.voltages.n1;
    const v2 = solved.voltages.n2;
    const leaving = v1 / 1000 + (v1 - v2) / 2000;
    expect(leaving).toBeCloseTo(0.003);
  });

  it("handles a grounded voltage source as a voltage divider", () => {
    const solved = solveNodal(groundedVoltageSource(2000, 2000, 10));
    expect(solved.voltages.n1).toBeCloseTo(5);
    expect(solved.voltages.vs).toBeCloseTo(10);
  });

  it("puts a current source straight into KCL", () => {
    const solved = solveNodal(currentSourceNode(2000, 2000, 0.002));
    expect(solved.voltages.n1).toBeCloseTo(2);
  });
});
