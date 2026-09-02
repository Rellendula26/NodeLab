export function formatOhms(value: number): string {
  if (Math.abs(value) >= 1e6) return `${trimNumber(value / 1e6)} MΩ`;
  if (Math.abs(value) >= 1e3) return `${trimNumber(value / 1e3)} kΩ`;
  return `${trimNumber(value)} Ω`;
}

export function formatVolts(value: number): string {
  return `${trimNumber(value)} V`;
}

export function formatAmps(value: number): string {
  const abs = Math.abs(value);
  if (abs > 0 && abs < 1e-3) return `${trimNumber(value * 1e6)} µA`;
  if (abs > 0 && abs < 1) return `${trimNumber(value * 1e3)} mA`;
  return `${trimNumber(value)} A`;
}

export function formatWatts(value: number): string {
  const abs = Math.abs(value);
  if (abs > 0 && abs < 1) return `${trimNumber(value * 1e3)} mW`;
  return `${trimNumber(value)} W`;
}

function trimNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
}
