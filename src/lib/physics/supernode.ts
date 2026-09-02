export function solveTwoNodeSupernode(
  R1: number,
  R3: number,
  Is: number,
  Vs: number,
): { V1: number; V2: number; I1: number; I3: number } {
  if (R1 <= 0 || R3 <= 0) throw new Error("Resistances must be positive.");
  const V1 = (Is - Vs / R3) / (1 / R1 + 1 / R3);
  const V2 = V1 + Vs;
  return {
    V1,
    V2,
    I1: V1 / R1,
    I3: V2 / R3,
  };
}
