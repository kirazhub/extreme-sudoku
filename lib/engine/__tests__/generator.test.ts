import { describe, it, expect } from "vitest";
import { fullSolution, makePuzzle } from "../generator";
import { configForSize } from "../geometry";
import { isValidGrid } from "../validator";
import { countSolutions, solve } from "../solver";
import { isFull } from "../board";
import { makeRng } from "../rng";

describe("generator", () => {
  describe("fullSolution", () => {
    it("4x4 tam ve gecerli cozum", () => {
      const c = configForSize(4);
      const g = fullSolution(c, makeRng(1));
      expect(isFull(g)).toBe(true);
      expect(isValidGrid(g, c)).toBe(true);
    });

    it("6x6 tam ve gecerli cozum", () => {
      const c = configForSize(6);
      const g = fullSolution(c, makeRng(2));
      expect(isFull(g)).toBe(true);
      expect(isValidGrid(g, c)).toBe(true);
    });

    it("9x9 tam ve gecerli cozum", () => {
      const c = configForSize(9);
      const g = fullSolution(c, makeRng(3));
      expect(isFull(g)).toBe(true);
      expect(isValidGrid(g, c)).toBe(true);
    });

    it("16x16 tam ve gecerli cozum", () => {
      const c = configForSize(16);
      const g = fullSolution(c, makeRng(4));
      expect(isFull(g)).toBe(true);
      expect(isValidGrid(g, c)).toBe(true);
    });

    it("ayni seed -> ayni tam cozum (determinism)", () => {
      const c = configForSize(9);
      const a = fullSolution(c, makeRng(123));
      const b = fullSolution(c, makeRng(123));
      expect(Array.from(a)).toEqual(Array.from(b));
    });
  });

  describe("makePuzzle", () => {
    it("4x4 tek cozumlu", () => {
      const c = configForSize(4);
      const p = makePuzzle({ config: c, difficulty: "easy", seed: 10 });
      expect(countSolutions(p.givens.slice(), c, 2)).toBe(1);
      // givens cozumun alt kumesi
      for (let i = 0; i < p.givens.length; i++) {
        if (p.givens[i] !== 0) expect(p.givens[i]).toBe(p.solution[i]);
      }
    });

    it("6x6 tek cozumlu", () => {
      const c = configForSize(6);
      const p = makePuzzle({ config: c, difficulty: "easy", seed: 11 });
      expect(countSolutions(p.givens.slice(), c, 2)).toBe(1);
    });

    it("9x9 tek cozumlu", () => {
      const c = configForSize(9);
      const p = makePuzzle({ config: c, difficulty: "easy", seed: 12 });
      expect(countSolutions(p.givens.slice(), c, 2)).toBe(1);
    });

    it("16x16 gecerli ve cozulebilir", () => {
      const c = configForSize(16);
      const p = makePuzzle({ config: c, difficulty: "easy", seed: 13 });
      expect(isValidGrid(p.givens, c)).toBe(true);
      const s = solve(p.givens.slice(), c);
      expect(s).not.toBeNull();
      expect(isValidGrid(s!, c)).toBe(true);
    }, 60_000);
  });
});
