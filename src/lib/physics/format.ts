export function formatValue(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 1e-12) return "0";
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.001) return value.toExponential(2);
  const rounded = Number(value.toPrecision(digits));
  return String(rounded);
}

export function formatOhms(value: number): string {
  if (Math.abs(value) >= 1e6) return `${formatValue(value / 1e6)} MΩ`;
  if (Math.abs(value) >= 1e3) return `${formatValue(value / 1e3)} kΩ`;
  return `${formatValue(value)} Ω`;
}

export function formatVolts(value: number): string {
  return `${formatValue(value)} V`;
}

export function formatAmps(value: number): string {
  const abs = Math.abs(value);
  if (abs > 0 && abs < 1e-3) return `${formatValue(value * 1e6)} µA`;
  if (abs > 0 && abs < 1) return `${formatValue(value * 1e3)} mA`;
  return `${formatValue(value)} A`;
}

export function nearlyEqual(a: number, b: number, tol = 1e-6): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}
