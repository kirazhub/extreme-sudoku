import type { GameConfig, Grid } from "./types";
import { index } from "./geometry";

// Grid (tahta) icin yardimcilar: olusturma, kopyalama, hucre erisimi, string serilestirme.

/** Bos bir grid dondurur (size*size uzunlukta, hepsi 0). */
export function createEmpty(config: GameConfig): Grid {
  return new Array(config.size * config.size).fill(0);
}

/** Bagimsiz bir kopya dondurur. */
export function cloneGrid(grid: Grid): Grid {
  return grid.slice();
}

/** (row, col) hucresinin degerini okur. */
export function getCell(
  grid: Grid,
  row: number,
  col: number,
  config: GameConfig
): number {
  return grid[index(row, col, config.size)];
}

/** (row, col) hucresine deger yazar (yerinde mutasyon). */
export function setCell(
  grid: Grid,
  row: number,
  col: number,
  value: number,
  config: GameConfig
): void {
  grid[index(row, col, config.size)] = value;
}

/** Dolu (sifirdan farkli) hucre sayisi. */
export function filledCount(grid: Grid): number {
  let n = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i] !== 0) n++;
  return n;
}

/** Tum hucreler dolu mu? */
export function isFull(grid: Grid): boolean {
  for (let i = 0; i < grid.length; i++) if (grid[i] === 0) return false;
  return true;
}

/**
 * Grid -> string. 16 destegi icin nokta-ayraçli format kullanilir:
 * hucreler "." ile ayrilir, bos = "0".
 * Format: "5.3.0.0.7..." gibi. 9x9 icin de ayni format calisir.
 */
export function toString(grid: Grid, _config: GameConfig): string {
  void _config; // simdilik kullanilmiyor ama API tutarliligi icin tutalim
  return grid.join(".");
}

/** string -> Grid. */
export function fromString(s: string, config: GameConfig): Grid {
  const parts = s.split(".");
  if (parts.length !== config.size * config.size) {
    throw new Error(
      `Beklenen hucre sayisi ${config.size * config.size}, gelen ${parts.length}`
    );
  }
  const grid: Grid = new Array(parts.length);
  for (let i = 0; i < parts.length; i++) {
    const n = parts[i] === "" ? 0 : Number(parts[i]);
    if (!Number.isInteger(n) || n < 0 || n > config.size) {
      throw new Error(`Gecersiz hucre degeri: "${parts[i]}" indeks ${i}`);
    }
    grid[i] = n;
  }
  return grid;
}
