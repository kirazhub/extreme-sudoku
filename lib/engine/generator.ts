import type { Difficulty, GameConfig, Grid, Puzzle } from "./types";
import { createEmpty, cloneGrid } from "./board";
import { canPlace, candidates } from "./validator";
import { countSolutions } from "./solver";
import { shuffle } from "./rng";
import { targetClues } from "./difficulty";

// Bulmaca uretici: tam cozum + ipucu boslatma.
// Determinizm icin Set iterasyonu yerine sirali diziyi rng ile karistiririz.

/**
 * Bos tahtadan rastgele (ama deterministik) bir tam cozum uretir.
 * Random-order backtracking: her bos hucrede adaylari sirala -> shuffle -> sirayla dene.
 */
export function fullSolution(config: GameConfig, rng: () => number): Grid {
  const grid = createEmpty(config);
  if (!fillNext(grid, config, rng, 0)) {
    // Pratikte 4/6/9/16 icin bu daima basarili olmali.
    throw new Error("fullSolution: tam cozum uretilemedi");
  }
  return grid;
}

function fillNext(
  grid: Grid,
  config: GameConfig,
  rng: () => number,
  startIdx: number
): boolean {
  // Bir sonraki bos hucreyi bul.
  let idx = -1;
  for (let i = startIdx; i < grid.length; i++) {
    if (grid[i] === 0) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return true;

  // Adaylari sirali diziye al, sonra karistir (deterministik).
  const cs = candidates(grid, idx, config);
  const sorted = Array.from(cs).sort((a, b) => a - b);
  const order = shuffle(sorted, rng);

  for (const v of order) {
    if (canPlace(grid, idx, v, config)) {
      grid[idx] = v;
      if (fillNext(grid, config, rng, idx + 1)) return true;
      grid[idx] = 0;
    }
  }
  return false;
}

export interface MakePuzzleOpts {
  config: GameConfig;
  difficulty: Difficulty;
  /** Determinizm tohumu. */
  seed: number;
  /**
   * Kullanicinin "ipucu yogunlugu" kaydiricisi: pozitif daha cok ipucu,
   * negatif daha az ipucu birakir. Hedef ipucu sayisina eklenir.
   */
  extraClues?: number;
}

/**
 * Verilen zorluk hedefine uygun, tek cozumlu bir bulmaca uretir.
 * extraClues ile kullanici hedef ipucu sayisini ayarlayabilir.
 */
export function makePuzzle(opts: MakePuzzleOpts): Puzzle {
  const { config, difficulty, seed } = opts;
  const extra = opts.extraClues ?? 0;

  // 1) Tam cozum (deterministik).
  const baseRng = mulberry(seed);
  const solution = fullSolution(config, baseRng);

  // 2) Hedef ipucu sayisi.
  const total = config.size * config.size;
  const target = clamp(
    targetClues(difficulty, config) + extra,
    Math.floor(total * 0.2),
    total
  );
  // Cikarilacak hucre sayisi:
  const removalsTarget = total - target;

  // 3) Hucre indekslerini deterministik karistir, sirayla bosaltmayi dene.
  const removalRng = mulberry(seed ^ 0x9e3779b9);
  const order = shuffle(
    Array.from({ length: total }, (_, i) => i),
    removalRng
  );

  const givens = cloneGrid(solution);
  let removed = 0;
  // 16x16 icin maksimum deneme sayisini sinirla (performans icin).
  const maxAttempts = config.size === 16 ? Math.min(order.length, 120) : order.length;

  for (let attempt = 0; attempt < maxAttempts && removed < removalsTarget; attempt++) {
    const idx = order[attempt];
    if (givens[idx] === 0) continue;
    const backup = givens[idx];
    givens[idx] = 0;
    // Tek cozumlu mu? (limit=2)
    const n = countSolutions(givens, config, 2);
    if (n !== 1) {
      givens[idx] = backup;
    } else {
      removed++;
    }
  }

  return { givens, solution, config, difficulty };
}

// Yerel kucuk yardimcilar (rng.ts'i ithal etmemek icin tekrar yazmiyoruz - import edelim).
function mulberry(seed: number): () => number {
  // rng.ts'deki makeRng ile ayni algoritma; burada dolayli kullanim icin kucuk kopya.
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
