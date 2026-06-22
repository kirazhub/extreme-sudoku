import { describe, it, expect } from "vitest";
import { solve, countSolutions } from "../solver";
import { configForSize } from "../geometry";
import { createEmpty, fromString } from "../board";
import { isValidGrid } from "../validator";

// Klasik 9x9 bulmaca (Wikipedia "Sudoku" makalesinden alintilanmis ornek).
// Satir bazinda, 0 = bos.
const PUZZLE_9X9 = [
  5, 3, 0, 0, 7, 0, 0, 0, 0,
  6, 0, 0, 1, 9, 5, 0, 0, 0,
  0, 9, 8, 0, 0, 0, 0, 6, 0,
  8, 0, 0, 0, 6, 0, 0, 0, 3,
  4, 0, 0, 8, 0, 3, 0, 0, 1,
  7, 0, 0, 0, 2, 0, 0, 0, 6,
  0, 6, 0, 0, 0, 0, 2, 8, 0,
  0, 0, 0, 4, 1, 9, 0, 0, 5,
  0, 0, 0, 0, 8, 0, 0, 7, 9,
];

const SOLUTION_9X9 = [
  5, 3, 4, 6, 7, 8, 9, 1, 2,
  6, 7, 2, 1, 9, 5, 3, 4, 8,
  1, 9, 8, 3, 4, 2, 5, 6, 7,
  8, 5, 9, 7, 6, 1, 4, 2, 3,
  4, 2, 6, 8, 5, 3, 7, 9, 1,
  7, 1, 3, 9, 2, 4, 8, 5, 6,
  9, 6, 1, 5, 3, 7, 2, 8, 4,
  2, 8, 7, 4, 1, 9, 6, 3, 5,
  3, 4, 5, 2, 8, 6, 1, 7, 9,
];

describe("solver", () => {
  it("9x9 bilinen bulmacayi cozer", () => {
    const c = configForSize(9);
    const solved = solve(PUZZLE_9X9.slice(), c);
    expect(solved).not.toBeNull();
    expect(Array.from(solved!)).toEqual(SOLUTION_9X9);
  });

  it("9x9 cozulemez (gecersiz) bulmaca null doner", () => {
    const c = configForSize(9);
    const g = createEmpty(c);
    // ayni satira ayni deger -> gecersiz baslangic, ama isValidGrid kontrolu solver'in disinda olabilir.
    // Onun yerine cozumsuz bir bulmaca kuralim: tek satira 1-8 koy ve 9'u baska bir yolla blokla.
    // En basit: birinci satir 1..8, 9. hucre bos; ayni sutuna 9 koy.
    for (let col = 0; col < 8; col++) g[col] = col + 1;
    g[9 * 1 + 8] = 9; // (1,8) = 9, dolayisiyla (0,8) = 9 olamaz, ama tek aday 9. Sutun 8'de baska 9 var.
    // Ayrica satir 0'da 1..8 dolu -> (0,8) = 9 olmali, ama sutunda 9 var -> cozumsuz.
    const solved = solve(g, c);
    expect(solved).toBeNull();
  });

  it("4x4 bos tahta bir cozum bulur (4! benzeri cok cozum vardir, biri donmeli)", () => {
    const c = configForSize(4);
    const solved = solve(createEmpty(c), c);
    expect(solved).not.toBeNull();
    expect(isValidGrid(solved!, c)).toBe(true);
    expect(solved!.every((v) => v >= 1 && v <= 4)).toBe(true);
  });

  it("countSolutions: 9x9 bilinen bulmaca tek cozumlu", () => {
    const c = configForSize(9);
    const n = countSolutions(PUZZLE_9X9.slice(), c, 2);
    expect(n).toBe(1);
  });

  it("countSolutions: bos 4x4 birden fazla cozum (limit=2 ile 2)", () => {
    const c = configForSize(4);
    const n = countSolutions(createEmpty(c), c, 2);
    expect(n).toBe(2);
  });
});
