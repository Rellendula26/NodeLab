export function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  if (matrix.length !== n || matrix.some((row) => row.length !== n)) {
    throw new Error("Matrix and right-hand side sizes do not match.");
  }

  const work = matrix.map((row, i) => [...row, rhs[i]]);

  for (let pivot = 0; pivot < n; pivot += 1) {
    let best = pivot;
    for (let row = pivot + 1; row < n; row += 1) {
      if (Math.abs(work[row][pivot]) > Math.abs(work[best][pivot])) best = row;
    }
    [work[pivot], work[best]] = [work[best], work[pivot]];

    const diagonal = work[pivot][pivot];
    if (Math.abs(diagonal) < 1e-14) {
      throw new Error("Singular conductance matrix.");
    }

    for (let col = pivot; col <= n; col += 1) {
      work[pivot][col] /= diagonal;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === pivot) continue;
      const factor = work[row][pivot];
      for (let col = pivot; col <= n; col += 1) {
        work[row][col] -= factor * work[pivot][col];
      }
    }
  }

  return work.map((row) => row[n]);
}
