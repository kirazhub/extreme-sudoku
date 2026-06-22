// Public API: Sudoku motorunun di? dunyaya acilan tek noktasi.
// Tum frontend kodu burayi kullanmali; ic modulleri (solver.ts vb.) import etmemeli.

import type { GameConfig, Grid, Hint, Puzzle, Difficulty } from "./types";
import { configForSize as _configForSize } from "./geometry";
import { canPlace as _canPlace } from "./validator";
import { nextHint, solveLogically as _solveLogically } from "./logicalSolver";
import type { LogicalSolveResult } from "./logicalSolver";
import { makePuzzle } from "./generator";
import { rateDifficulty as _rateDifficulty } from "./difficulty";

// Tipleri yeniden dis ariza et.
export type { GameConfig, Grid, Hint, Puzzle, Difficulty, LogicalSolveResult };

/** Boyut icin geometri config'i. (Bkz. geometry.configForSize) */
export const configForSize = _configForSize;

/** Bir degerin hucreye konulup konulamayacagini soyler. (Bkz. validator.canPlace) */
export const canPlace = _canPlace;

/** Backtracking'siz mantiksal cozucu. */
export const solveLogically = _solveLogically;

/** Mantiksal cozucu temelli, gercek teknik zorluk derecelendirmesi. */
export const rateDifficulty = _rateDifficulty;

export interface NewPuzzleOpts {
  /** Tahta boyutu: 4, 6, 9 veya 16. */
  size: number;
  /** Hedef zorluk. */
  difficulty: Difficulty;
  /** Tekrarlanabilirlik icin tohum. */
  seed: number;
  /** Hedef ipucu sayisina eklenen yogunluk farki. */
  extraClues?: number;
}

/** Yeni bir bulmaca uretir. Ayni parametre seti her zaman ayni sonucu verir. */
export function newPuzzle(opts: NewPuzzleOpts): Puzzle {
  const config = _configForSize(opts.size);
  return makePuzzle({
    config,
    difficulty: opts.difficulty,
    seed: opts.seed,
    extraClues: opts.extraClues,
  });
}

/** Tahta icin bir sonraki kullanilabilir ipucunu doner; yoksa null. */
export function hint(grid: Grid, config: GameConfig): Hint | null {
  return nextHint(grid, config);
}

/** Kullanicinin tahtasi tam ve cozumle ayni mi? */
export function isSolved(grid: Grid, solution: Grid): boolean {
  if (grid.length !== solution.length) return false;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== solution[i]) return false;
  }
  return true;
}

/**
 * Bir tarih icin gunluk bulmaca tohumunu (deterministik) doner.
 * Ayni gun ayni tohum; farkli gun farkli tohum.
 * Saat dilimi farkliliklarini onlemek icin UTC tarihi kullanir.
 */
export function dailySeed(date?: Date): number {
  const d = date ?? new Date();
  // Sadece YYYY-MM-DD'yi UTC olarak al.
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  // Kucuk basit hash: yyyymmdd sayisini mulberry hash'e ver.
  const ymd = y * 10000 + m * 100 + day;
  // splitmix benzeri tek tur karistirici (deterministik, hizli).
  let x = ymd >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x;
}
