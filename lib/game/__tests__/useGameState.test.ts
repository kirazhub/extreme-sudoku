// useGameState hook'unun saf yardimcilarini test eder.
// React render etmiyoruz — sadece export edilen yardimci fonksiyonlar.

import { describe, expect, it } from "vitest";
import {
  clearNotesAt,
  formatTime,
  isBoardFull,
  isGiven,
  placeValue,
  toggleNote,
} from "../useGameState";
import type { Puzzle } from "@/lib/engine";

// Test icin minimal puzzle uretici (4x4 olsun).
function makePuzzle(givens: number[], solution: number[]): Puzzle {
  return {
    givens,
    solution,
    config: { size: 4, boxRows: 2, boxCols: 2 },
    difficulty: "easy",
  };
}

describe("isGiven", () => {
  it("givens'te sifir olmayan deger varsa true", () => {
    const p = makePuzzle([1, 0, 0, 0], [1, 2, 3, 4]);
    expect(isGiven(p, 0)).toBe(true);
    expect(isGiven(p, 1)).toBe(false);
  });
});

describe("isBoardFull", () => {
  it("tum hucreler doluysa true", () => {
    expect(isBoardFull([1, 2, 3, 4])).toBe(true);
  });
  it("herhangi bir hucre sifirsa false", () => {
    expect(isBoardFull([1, 0, 3, 4])).toBe(false);
  });
});

describe("placeValue", () => {
  const p = makePuzzle([1, 0, 0, 0], [1, 2, 3, 4]);

  it("verilen hucreyi degistirmez", () => {
    const board = [1, 0, 0, 0];
    const next = placeValue(board, p, 0, 3);
    expect(next).toEqual([1, 0, 0, 0]);
  });

  it("bos hucreye deger yazar", () => {
    const board = [1, 0, 0, 0];
    const next = placeValue(board, p, 1, 2);
    expect(next).toEqual([1, 2, 0, 0]);
  });

  it("ayni degeri tekrar yazinca siler (toggle)", () => {
    const board = [1, 2, 0, 0];
    const next = placeValue(board, p, 1, 2);
    expect(next).toEqual([1, 0, 0, 0]);
  });

  it("0 deger yazinca siler", () => {
    const board = [1, 3, 0, 0];
    const next = placeValue(board, p, 1, 0);
    expect(next).toEqual([1, 0, 0, 0]);
  });

  it("immutable: yeni dizi doner", () => {
    const board = [1, 0, 0, 0];
    const next = placeValue(board, p, 1, 2);
    expect(next).not.toBe(board);
    expect(board).toEqual([1, 0, 0, 0]); // orijinal degismedi
  });

  it("gecersiz indeks ayni diziyi doner", () => {
    const board = [1, 0, 0, 0];
    const next = placeValue(board, p, -1, 2);
    expect(next).toBe(board);
  });
});

describe("formatTime", () => {
  it("0 saniye -> 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });
  it("65 saniye -> 01:05", () => {
    expect(formatTime(65)).toBe("01:05");
  });
  it("3599 saniye -> 59:59", () => {
    expect(formatTime(3599)).toBe("59:59");
  });
  it("3600 saniye -> 60:00", () => {
    expect(formatTime(3600)).toBe("60:00");
  });
});

describe("toggleNote", () => {
  it("yoksa ekler", () => {
    const next = toggleNote({}, 5, 3);
    expect(next).toEqual({ 5: [3] });
  });
  it("varsa cikartir", () => {
    const next = toggleNote({ 5: [3] }, 5, 3);
    expect(next).toEqual({});
  });
  it("birden fazla not", () => {
    let n = toggleNote({}, 0, 5);
    n = toggleNote(n, 0, 2);
    n = toggleNote(n, 0, 8);
    expect(n[0]).toEqual([2, 5, 8]); // sirali
  });
  it("immutable: orijinali degistirmez", () => {
    const orig = { 5: [3] };
    toggleNote(orig, 5, 7);
    expect(orig).toEqual({ 5: [3] });
  });
});

describe("clearNotesAt", () => {
  it("bir hucredeki notlari siler", () => {
    expect(clearNotesAt({ 1: [2, 3], 2: [4] }, 1)).toEqual({ 2: [4] });
  });
  it("not yoksa ayni nesneyi doner", () => {
    const orig = { 1: [2] };
    expect(clearNotesAt(orig, 99)).toBe(orig);
  });
});
