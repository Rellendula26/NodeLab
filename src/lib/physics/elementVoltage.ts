export interface ElementVoltageResult {
  absoluteV1: number;
  absoluteV2: number;
  displayV1: number;
  displayV2: number;
  VR: number;
  current: number;
}

/**
 * Node voltages are absolute potentials. Shifting ground subtracts the same
 * offset from every displayed node voltage; the drop and current stay put.
 */
export function elementBranch(
  V1: number,
  V2: number,
  resistance: number,
  groundShift = 0,
): ElementVoltageResult {
  if (resistance <= 0) throw new Error("Resistance must be positive.");
  const VR = V1 - V2;
  return {
    absoluteV1: V1,
    absoluteV2: V2,
    displayV1: V1 - groundShift,
    displayV2: V2 - groundShift,
    VR,
    current: VR / resistance,
  };
}
