import type { GameConfig, Grid } from "./types";
import { rowOf, colOf } from "./geometry";

// Solver: MRV sezgili backtracking. 16x16 icin bitmask kullanir ki hizli olsun.
// Not: 16x16 -> 16 bit. JS sayilari 32-bit bitwise destekledigi icin sorun yok.

/**
 * Tahtanin satir/sutun/kutu bitmask'lerini hesaplar.
 * mask'in i. biti 1 ise (i+1) degeri o birimde zaten dolu.
 */
function computeMasks(grid: Grid, config: GameConfig) {
  const { size, boxRows, boxCols } = config;
  const boxesPerRow = size / boxCols;
  const rowMask = new Int32Array(size);
  const colMask = new Int32Array(size);
  const boxMask = new Int32Array(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r * size + c];
      if (v !== 0) {
        const bit = 1 << (v - 1);
        rowMask[r] |= bit;
        colMask[c] |= bit;
        const b = Math.floor(r / boxRows) * boxesPerRow + Math.floor(c / boxCols);
        boxMask[b] |= bit;
      }
    }
  }
  return { rowMask, colMask, boxMask };
}

function boxIndexFor(idx: number, config: GameConfig): number {
  const r = rowOf(idx, config.size);
  const c = colOf(idx, config.size);
  const boxesPerRow = config.size / config.boxCols;
  return Math.floor(r / config.boxRows) * boxesPerRow + Math.floor(c / config.boxCols);
}

// 32-bit bir tamsayidaki set bit sayisini sayar (popcount).
function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return (Math.imul(x, 0x01010101) >>> 24);
}

/**
 * MRV ile en az adayli bos hucreyi bulur.
 * Donus: { idx, candidatesMask } veya tum hucreler doluysa null,
 * en az bir hucrede 0 aday varsa { idx: -1, candidatesMask: 0 } (cikmaz).
 */
function findBestCell(
  grid: Grid,
  config: GameConfig,
  rowMask: Int32Array,
  colMask: Int32Array,
  boxMask: Int32Array
): { idx: number; mask: number } | null {
  const { size, boxRows, boxCols } = config;
  const boxesPerRow = size / boxCols;
  const fullMask = (1 << size) - 1;
  let bestIdx = -2;
  let bestMask = 0;
  let bestCount = size + 1;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      if (grid[idx] !== 0) continue;
      const b = Math.floor(r / boxRows) * boxesPerRow + Math.floor(c / boxCols);
      const used = rowMask[r] | colMask[c] | boxMask[b];
      const candMask = fullMask & ~used;
      const cnt = popcount(candMask);
      if (cnt < bestCount) {
        bestCount = cnt;
        bestIdx = idx;
        bestMask = candMask;
        if (cnt === 0) return { idx, mask: 0 }; // cikmaz: hemen geri don
        if (cnt === 1) return { idx, mask: candMask };
      }
    }
  }
  if (bestIdx === -2) return null; // tum hucreler dolu
  return { idx: bestIdx, mask: bestMask };
}

/**
 * Backtracking ile bulmacayi cozmeye calisir. Cozum bulunursa
 * gridin YENI bir kopyasini doner; cozum yoksa null.
 */
export function solve(grid: Grid, config: GameConfig): Grid | null {
  const work = grid.slice();
  const { rowMask, colMask, boxMask } = computeMasks(work, config);
  if (recurseSolve(work, config, rowMask, colMask, boxMask)) {
    return work;
  }
  return null;
}

function recurseSolve(
  grid: Grid,
  config: GameConfig,
  rowMask: Int32Array,
  colMask: Int32Array,
  boxMask: Int32Array
): boolean {
  const best = findBestCell(grid, config, rowMask, colMask, boxMask);
  if (best === null) return true; // tum hucreler dolu
  if (best.mask === 0) return false; // cikmaz

  const { idx, mask } = best;
  const { size } = config;
  const r = rowOf(idx, size);
  const c = colOf(idx, size);
  const b = boxIndexFor(idx, config);

  let m = mask;
  while (m !== 0) {
    // En dusuk set biti sec
    const lowBit = m & -m;
    const v = Math.log2(lowBit) + 1; // bit -> deger
    grid[idx] = v;
    rowMask[r] |= lowBit;
    colMask[c] |= lowBit;
    boxMask[b] |= lowBit;

    if (recurseSolve(grid, config, rowMask, colMask, boxMask)) return true;

    // Geri al
    grid[idx] = 0;
    rowMask[r] &= ~lowBit;
    colMask[c] &= ~lowBit;
    boxMask[b] &= ~lowBit;

    m &= m - 1; // bu biti at, sonrakine gec
  }
  return false;
}

/**
 * Cozum sayisini limit'e kadar sayar. Benzersizlik testi icin limit=2 yeterlidir.
 */
export function countSolutions(
  grid: Grid,
  config: GameConfig,
  limit: number
): number {
  const work = grid.slice();
  const { rowMask, colMask, boxMask } = computeMasks(work, config);
  const counter = { n: 0 };
  recurseCount(work, config, rowMask, colMask, boxMask, counter, limit);
  return counter.n;
}

function recurseCount(
  grid: Grid,
  config: GameConfig,
  rowMask: Int32Array,
  colMask: Int32Array,
  boxMask: Int32Array,
  counter: { n: number },
  limit: number
): void {
  if (counter.n >= limit) return;
  const best = findBestCell(grid, config, rowMask, colMask, boxMask);
  if (best === null) {
    counter.n++;
    return;
  }
  if (best.mask === 0) return;

  const { idx, mask } = best;
  const { size } = config;
  const r = rowOf(idx, size);
  const c = colOf(idx, size);
  const b = boxIndexFor(idx, config);

  let m = mask;
  while (m !== 0 && counter.n < limit) {
    const lowBit = m & -m;
    const v = Math.log2(lowBit) + 1;
    grid[idx] = v;
    rowMask[r] |= lowBit;
    colMask[c] |= lowBit;
    boxMask[b] |= lowBit;

    recurseCount(grid, config, rowMask, colMask, boxMask, counter, limit);

    grid[idx] = 0;
    rowMask[r] &= ~lowBit;
    colMask[c] &= ~lowBit;
    boxMask[b] &= ~lowBit;

    m &= m - 1;
  }
}
