export interface WheatstoneSensorResult {
  V1: number;
  V2: number;
  Vout: number;
  approx: number;
  ratio: number;
}

/**
 * Four-resistor bridge. Left divider is R-R. Right divider is R and R+ΔR.
 * V1 is the left mid-node, V2 the right mid-node.
 */
export function wheatstoneSensor(V0: number, R: number, dR: number): WheatstoneSensorResult {
  if (R <= 0) throw new Error("R must be positive.");
  if (R + dR <= 0) throw new Error("Sensor resistance must stay positive.");

  const V1 = V0 / 2;
  const V2 = (V0 * (R + dR)) / (2 * R + dR);
  const Vout = V2 - V1;
  const approx = (V0 / 4) * (dR / R);
  return { V1, V2, Vout, approx, ratio: dR / R };
}

/**
 * Open-circuit mid-node voltages of a general Wheatstone bridge.
 * R1 top-left, R3 bottom-left, R2 top-right, Rx bottom-right.
 */
export function wheatstoneOpenCircuit(
  V0: number,
  R1: number,
  R2: number,
  R3: number,
  Rx: number,
): { V1: number; V2: number; Vout: number; balanced: boolean; RxBalance: number } {
  if ([R1, R2, R3, Rx].some((value) => value <= 0)) {
    throw new Error("Resistances must be positive.");
  }
  const V1 = (V0 * R3) / (R1 + R3);
  const V2 = (V0 * Rx) / (R2 + Rx);
  const RxBalance = (R2 / R1) * R3;
  return {
    V1,
    V2,
    Vout: V2 - V1,
    balanced: Math.abs(V1 - V2) < 1e-6 * Math.max(1, Math.abs(V0)),
    RxBalance,
  };
}

export function sensorFromLight(Rdark: number, light: number): number {
  const clamped = Math.min(1, Math.max(0, light));
  return Rdark * (1 - 0.75 * clamped);
}

export function wheatstoneCurve(V0: number, R: number, samples = 41): Array<{
  ratio: number;
  exact: number;
  approx: number;
}> {
  const points = [];
  for (let i = 0; i < samples; i += 1) {
    const ratio = -0.8 + (1.6 * i) / (samples - 1);
    const dR = ratio * R;
    if (R + dR <= 0) continue;
    const result = wheatstoneSensor(V0, R, dR);
    points.push({ ratio, exact: result.Vout, approx: result.approx });
  }
  return points;
}
