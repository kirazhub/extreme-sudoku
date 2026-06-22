import type { GameConfig, Grid } from "./types";
import { peersOf, units, rowOf, colOf } from "./geometry";

// Yerlestirme dogrulayicilari: tek hucre + tum tahta + adaylar.

/**
 * value degeri verilen indekse konabilir mi?
 * Peer hucrelerin (satir/sutun/kutu) hicbirinde ayni deger olmamalidir.
 */
export function canPlace(
  grid: Grid,
  idx: number,
  value: number,
  config: GameConfig
): boolean {
  if (value < 1 || value > config.size) return false;
  // Peers icindeki herhangi bir hucrede ayni deger varsa konamaz.
  // Hizli yol: peersOf yerine satir/sutun/kutu'yu inline gez (sicak yol).
  const { size } = config;
  const r = rowOf(idx, size);
  const c = colOf(idx, size);
  // Satir
  for (let col = 0; col < size; col++) {
    if (col === c) continue;
    if (grid[r * size + col] === value) return false;
  }
  // Sutun
  for (let row = 0; row < size; row++) {
    if (row === r) continue;
    if (grid[row * size + c] === value) return false;
  }
  // Kutu
  const boxRowStart = Math.floor(r / config.boxRows) * config.boxRows;
  const boxColStart = Math.floor(c / config.boxCols) * config.boxCols;
  for (let row = boxRowStart; row < boxRowStart + config.boxRows; row++) {
    for (let col = boxColStart; col < boxColStart + config.boxCols; col++) {
      if (row === r && col === c) continue;
      if (grid[row * size + col] === value) return false;
    }
  }
  return true;
}

/**
 * Bos hucre icin tum gecerli aday degerleri Set olarak dondurur.
 * Dolu hucre icin bos set doner.
 */
export function candidates(
  grid: Grid,
  idx: number,
  config: GameConfig
): Set<number> {
  const result = new Set<number>();
  if (grid[idx] !== 0) return result;
  // Peer'lerde gorulen degerleri topla.
  const peers = peersOf(idx, config);
  const blocked = new Set<number>();
  for (const p of peers) {
    const v = grid[p];
    if (v !== 0) blocked.add(v);
  }
  for (let v = 1; v <= config.size; v++) {
    if (!blocked.has(v)) result.add(v);
  }
  return result;
}

/**
 * Tum tahta gecerli mi? Yani hicbir birimde tekrar eden non-zero deger yok mu?
 * (Bos hucreler goz ardi edilir; tam dolu olmasi gerekmez.)
 */
export function isValidGrid(grid: Grid, config: GameConfig): boolean {
  for (const unit of units(config)) {
    const seen = new Set<number>();
    for (const idx of unit) {
      const v = grid[idx];
      if (v === 0) continue;
      if (seen.has(v)) return false;
      seen.add(v);
    }
  }
  return true;
}
