import type { GameConfig } from "./types";

// Tahta geometrisi yardimcilari: indeks <-> (satir, sutun), kutu hesaplari, peer'ler, birimler.

/**
 * Desteklenen boyut icin geometriyi dondurur.
 * - 4x4 -> 2x2 kutu
 * - 6x6 -> 2x3 kutu
 * - 9x9 -> 3x3 kutu
 * - 16x16 -> 4x4 kutu
 */
export function configForSize(size: number): GameConfig {
  switch (size) {
    case 4:
      return { size: 4, boxRows: 2, boxCols: 2 };
    case 6:
      return { size: 6, boxRows: 2, boxCols: 3 };
    case 9:
      return { size: 9, boxRows: 3, boxCols: 3 };
    case 16:
      return { size: 16, boxRows: 4, boxCols: 4 };
    default:
      throw new Error(`Desteklenmeyen tahta boyutu: ${size}`);
  }
}

/** (satir, sutun) -> duz dizi indeksine cevirir. */
export function index(row: number, col: number, size: number): number {
  return row * size + col;
}

/** Duz indeksten satir numarasini dondurur. */
export function rowOf(idx: number, size: number): number {
  return Math.floor(idx / size);
}

/** Duz indeksten sutun numarasini dondurur. */
export function colOf(idx: number, size: number): number {
  return idx % size;
}

/** (satir, sutun) hucresinin ait oldugu kutunun indeksini dondurur. */
export function boxIndexOf(
  row: number,
  col: number,
  config: GameConfig
): number {
  const boxRow = Math.floor(row / config.boxRows);
  const boxCol = Math.floor(col / config.boxCols);
  // Kutular soldan saga, yukaridan asagiya numaralandirilir.
  // Satirda boxCols/boxRows degil, "kac kutu var" lazim: size / boxCols
  const boxesPerRow = config.size / config.boxCols;
  return boxRow * boxesPerRow + boxCol;
}

/**
 * Belirli bir hucrenin tum peer'lerini (ayni satir/sutun/kutu, kendisi haric)
 * eski seksiz Set olarak dondurur.
 */
export function peersOf(idx: number, config: GameConfig): Set<number> {
  const { size } = config;
  const r = rowOf(idx, size);
  const c = colOf(idx, size);
  const result = new Set<number>();

  // Satir
  for (let col = 0; col < size; col++) {
    if (col !== c) result.add(index(r, col, size));
  }
  // Sutun
  for (let row = 0; row < size; row++) {
    if (row !== r) result.add(index(row, c, size));
  }
  // Kutu
  const boxRowStart = Math.floor(r / config.boxRows) * config.boxRows;
  const boxColStart = Math.floor(c / config.boxCols) * config.boxCols;
  for (let row = boxRowStart; row < boxRowStart + config.boxRows; row++) {
    for (let col = boxColStart; col < boxColStart + config.boxCols; col++) {
      if (row !== r || col !== c) result.add(index(row, col, size));
    }
  }

  return result;
}

/**
 * Tahtadaki tum birimleri (satirlar + sutunlar + kutular) dondurur.
 * Her birim, o birime ait hucrelerin duz indekslerinden olusur.
 */
export function units(config: GameConfig): number[][] {
  const { size } = config;
  const result: number[][] = [];

  // Satirlar
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) row.push(index(r, c, size));
    result.push(row);
  }
  // Sutunlar
  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) col.push(index(r, c, size));
    result.push(col);
  }
  // Kutular
  const boxesPerRow = size / config.boxCols;
  const boxesPerCol = size / config.boxRows;
  for (let br = 0; br < boxesPerCol; br++) {
    for (let bc = 0; bc < boxesPerRow; bc++) {
      const box: number[] = [];
      for (let r = br * config.boxRows; r < (br + 1) * config.boxRows; r++) {
        for (let c = bc * config.boxCols; c < (bc + 1) * config.boxCols; c++) {
          box.push(index(r, c, size));
        }
      }
      result.push(box);
    }
  }

  return result;
}
