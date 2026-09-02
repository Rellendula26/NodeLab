import { describe, expect, it } from "vitest";
import { wheatstoneOpenCircuit, wheatstoneSensor } from "./wheatstone";

describe("wheatstoneSensor", () => {
  it("is balanced when ΔR = 0", () => {
    const result = wheatstoneSensor(10, 1000, 0);
    expect(result.V1).toBeCloseTo(5);
    expect(result.V2).toBeCloseTo(5);
    expect(result.Vout).toBeCloseTo(0);
    expect(result.approx).toBeCloseTo(0);
  });

  it("matches the exact divider formula", () => {
    const result = wheatstoneSensor(12, 2000, 400);
    expect(result.V1).toBeCloseTo(6);
    expect(result.V2).toBeCloseTo((12 * 2400) / 4400);
    expect(result.Vout).toBeCloseTo(result.V2 - result.V1);
  });

  it("agrees with the small-signal approximation when ΔR ≪ R", () => {
    const result = wheatstoneSensor(8, 4000, 40);
    expect(result.approx).toBeCloseTo((8 / 4) * (40 / 4000));
    expect(Math.abs(result.Vout - result.approx)).toBeLessThan(0.005);
  });

  it("diverges from the linear model for large ΔR/R", () => {
    const result = wheatstoneSensor(10, 1000, 800);
    expect(Math.abs(result.Vout - result.approx)).toBeGreaterThan(0.2);
  });
});

describe("wheatstoneOpenCircuit", () => {
  it("balances when Rx = (R2/R1)R3", () => {
    const result = wheatstoneOpenCircuit(5, 1000, 2000, 1500, 3000);
    expect(result.balanced).toBe(true);
    expect(result.RxBalance).toBeCloseTo(3000);
    expect(result.Vout).toBeCloseTo(0);
  });
});
