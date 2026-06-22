import { describe, it, expect } from "vitest";
import { canPlace, candidates, isValidGrid } from "../validator";
import { createEmpty } from "../board";
import { configForSize, index } from "../geometry";

describe("validator", () => {
  describe("canPlace - satir/sutun/kutu cakismasi", () => {
    it("9x9 ayni satirda ayni deger -> false", () => {
      const c = configForSize(9);
      const g = createEmpty(c);
      g[index(0, 0, 9)] = 5;
      expect(canPlace(g, index(0, 5, 9), 5, c)).toBe(false);
    });

    it("9x9 ayni sutunda ayni deger -> false", () => {
      const c = configForSize(9);
      const g = createEmpty(c);
      g[index(0, 3, 9)] = 7;
      expect(canPlace(g, index(5, 3, 9), 7, c)).toBe(false);
    });

    it("9x9 ayni kutuda ayni deger -> false", () => {
      const c = configForSize(9);
      const g = createEmpty(c);
      g[index(0, 0, 9)] = 1;
      expect(canPlace(g, index(2, 2, 9), 1, c)).toBe(false);
    });

    it("9x9 cakisma yoksa -> true", () => {
      const c = configForSize(9);
      const g = createEmpty(c);
      expect(canPlace(g, index(0, 0, 9), 1, c)).toBe(true);
    });

    it("4x4 kutu cakismasi", () => {
      const c = configForSize(4);
      const g = createEmpty(c);
      g[index(0, 0, 4)] = 2;
      // (1,1) ayni kutuda
      expect(canPlace(g, index(1, 1, 4), 2, c)).toBe(false);
      // (2,2) farkli kutu
      expect(canPlace(g, index(2, 2, 4), 2, c)).toBe(true);
    });

    it("6x6 kutu cakismasi (boxRows=2,boxCols=3)", () => {
      const c = configForSize(6);
      const g = createEmpty(c);
      g[index(0, 0, 6)] = 3;
      // (1,2) ayni kutu (satir 0-1, sutun 0-2)
      expect(canPlace(g, index(1, 2, 6), 3, c)).toBe(false);
      // (3,3) farkli kutu, farkli satir, farkli sutun -> serbest
      expect(canPlace(g, index(3, 3, 6), 3, c)).toBe(true);
    });

    it("16x16 kutu cakismasi (boxRows=4,boxCols=4)", () => {
      const c = configForSize(16);
      const g = createEmpty(c);
      g[index(0, 0, 16)] = 10;
      // (3,3) ayni kutu
      expect(canPlace(g, index(3, 3, 16), 10, c)).toBe(false);
      // (4,4) farkli kutu
      expect(canPlace(g, index(4, 4, 16), 10, c)).toBe(true);
    });
  });

  describe("candidates", () => {
    it("4x4 bos hucrede tum semboller aday", () => {
      const c = configForSize(4);
      const g = createEmpty(c);
      const cs = candidates(g, 0, c);
      expect(cs.size).toBe(4);
      for (let v = 1; v <= 4; v++) expect(cs.has(v)).toBe(true);
    });

    it("4x4 dolu hucre -> bos set", () => {
      const c = configForSize(4);
      const g = createEmpty(c);
      g[0] = 2;
      expect(candidates(g, 0, c).size).toBe(0);
    });
  });

  describe("isValidGrid", () => {
    it("bos grid gecerli", () => {
      const c = configForSize(9);
      expect(isValidGrid(createEmpty(c), c)).toBe(true);
    });

    it("ayni satirda iki ayni deger -> gecersiz", () => {
      const c = configForSize(9);
      const g = createEmpty(c);
      g[index(0, 0, 9)] = 5;
      g[index(0, 5, 9)] = 5;
      expect(isValidGrid(g, c)).toBe(false);
    });
  });
});
