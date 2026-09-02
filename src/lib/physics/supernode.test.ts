import { describe, expect, it } from "vitest";
import { solveTwoNodeSupernode } from "./supernode";

describe("supernode", () => {
  it("enforces the source constraint and KCL around the boundary", () => {
    const result = solveTwoNodeSupernode(1000, 2000, 0.004, 6);
    expect(result.V2 - result.V1).toBeCloseTo(6);
    expect(result.I1 + result.I3).toBeCloseTo(0.004);
  });
});
