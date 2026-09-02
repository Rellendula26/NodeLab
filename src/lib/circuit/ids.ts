let next = 1;

export function createId(prefix: string): string {
  const id = `${prefix}_${next}`;
  next += 1;
  return id;
}

export function syncIdCounter(circuitIds: string[]): void {
  let max = next;
  for (const id of circuitIds) {
    const match = /_(\d+)$/.exec(id);
    if (match) {
      max = Math.max(max, Number(match[1]) + 1);
    }
  }
  next = max;
}
