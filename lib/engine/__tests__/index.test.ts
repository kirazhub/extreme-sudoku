import { describe, it, expect } from "vitest";
import {
  newPuzzle,
  hint,
  configForSize,
  isSolved,
  dailySeed,
} from "../index";
import { createEmpty } from "../board";

describe("public API (index)", () => {
  it("newPuzzle deterministik: ayni size+difficulty+seed -> ayni givens", () => {
    const a = newPuzzle({ size: 9, difficulty: "easy", seed: 777 });
    const b = newPuzzle({ size: 9, difficulty: "easy", seed: 777 });
    expect(Array.from(a.givens)).toEqual(Array.from(b.givens));
    expect(Array.from(a.solution)).toEqual(Array.from(b.solution));
  });

  it("isSolved: ayni grid -> true", () => {
    const p = newPuzzle({ size: 4, difficulty: "easy", seed: 1 });
    expect(isSolved(p.solution, p.solution)).toBe(true);
  });

  it("isSolved: bos grid solution'a esit degil -> false", () => {
    const p = newPuzzle({ size: 4, difficulty: "easy", seed: 2 });
    const empty = createEmpty(configForSize(4));
    expect(isSolved(empty, p.solution)).toBe(false);
  });

  it("hint: bos 9x9 grid icin null", () => {
    const c = configForSize(9);
    const empty = createEmpty(c);
    expect(hint(empty, c)).toBeNull();
  });

  it("dailySeed: ayni tarih ayni tohum", () => {
    const d = new Date("2026-05-15T12:00:00Z");
    const a = dailySeed(d);
    const b = dailySeed(d);
    expect(a).toBe(b);
  });

  it("dailySeed: farkli tarih farkli tohum", () => {
    const a = dailySeed(new Date("2026-05-15T00:00:00Z"));
    const b = dailySeed(new Date("2026-05-16T00:00:00Z"));
    expect(a).not.toBe(b);
  });
});
