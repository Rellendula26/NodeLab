import { calculateKCL } from "@/lib/circuit/analysis";

export interface SplitCurrents {
  incoming: number;
  right: number;
  up: number;
  residual: number;
}

export function splitTwoWays(incoming: number, fractionRight: number): SplitCurrents {
  const fraction = Math.min(1, Math.max(0, fractionRight));
  const right = incoming * fraction;
  const up = incoming * (1 - fraction);
  return {
    incoming,
    right,
    up,
    residual: incoming - right - up,
  };
}

export function algebraicKCL(
  currents: Array<{ amps: number; leaving: boolean }>,
): { sum: number; balanced: boolean } {
  const mapped = currents.map((branch) => ({
    amps: branch.amps,
    entering: !branch.leaving,
  }));
  const result = calculateKCL(mapped);
  return { sum: result.algebraicSum, balanced: result.balanced };
}

export function physicalDirection(referenceAmps: number): 1 | -1 | 0 {
  if (Math.abs(referenceAmps) < 1e-12) return 0;
  return referenceAmps > 0 ? 1 : -1;
}
