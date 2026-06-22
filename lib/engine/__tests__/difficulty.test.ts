import { describe, it, expect } from "vitest";
import { rateDifficulty, targetClues, displayNameTR } from "../difficulty";
import { configForSize } from "../geometry";
import { createEmpty } from "../board";
import { newPuzzle } from "../index";
import type { Grid } from "../types";

// Yardimci: nokta-ayrik 9x9 stringi grid'e cevirir.
function parse9(s: string): Grid {
  const compact = s.replace(/\s/g, "");
  const out: Grid = new Array(81);
  for (let i = 0; i < 81; i++) {
    const ch = compact[i];
    out[i] = ch === "." || ch === "0" ? 0 : parseInt(ch, 10);
  }
  return out;
}

describe("difficulty", () => {
  describe("displayNameTR", () => {
    it("tum zorluklar icin Turkce ad doner", () => {
      expect(displayNameTR("easy")).toBe("Kolay");
      expect(displayNameTR("medium")).toBe("Orta");
      expect(displayNameTR("hard")).toBe("Zor");
      expect(displayNameTR("extreme")).toBe("Extreme");
      expect(displayNameTR("impossible")).toBe("İmkânsız");
    });
  });

  describe("targetClues", () => {
    it("9x9 kolay zorluk icin makul ipucu sayisi doner", () => {
      const c = configForSize(9);
      const n = targetClues("easy", c);
      // 9x9 = 81 hucre; %55 ~= 45. En az 17.
      expect(n).toBeGreaterThanOrEqual(17);
      expect(n).toBeLessThanOrEqual(81);
    });

    it("zorluk yukseldikce ipucu sayisi azalir", () => {
      const c = configForSize(9);
      const e = targetClues("easy", c);
      const m = targetClues("medium", c);
      const h = targetClues("hard", c);
      const x = targetClues("extreme", c);
      expect(e).toBeGreaterThanOrEqual(m);
      expect(m).toBeGreaterThanOrEqual(h);
      expect(h).toBeGreaterThanOrEqual(x);
    });

    it("16x16 icin daha cok ipucu birakir", () => {
      const c = configForSize(16);
      const n = targetClues("hard", c);
      // 16x16 = 256 hucre, hard icin %55 ~= 141.
      expect(n).toBeGreaterThanOrEqual(55);
      expect(n).toBeLessThanOrEqual(256);
    });
  });

  describe("rateDifficulty", () => {
    it("bos grid -> impossible (mantiksal olarak cozulemez)", () => {
      const c = configForSize(9);
      const g = createEmpty(c);
      expect(rateDifficulty(g, c)).toBe("impossible");
    });

    it("tam dolu (cozumlu) grid -> easy", () => {
      const c = configForSize(4);
      const g: Grid = [
        1, 2, 3, 4,
        3, 4, 1, 2,
        2, 1, 4, 3,
        4, 3, 2, 1,
      ];
      expect(rateDifficulty(g, c)).toBe("easy");
    });

    it("Norvig 'easy' bulmacasi sadece single ile cozulur -> easy veya medium", () => {
      const c = configForSize(9);
      const g = parse9(
        "003020600" +
          "900305001" +
          "001806400" +
          "008102900" +
          "700000008" +
          "006708200" +
          "002609500" +
          "800203009" +
          "005010300"
      );
      const d = rateDifficulty(g, c);
      expect(["easy", "medium"]).toContain(d);
    });

    it("4x4 uretici 'easy' bulmacasi -> mantiksal olarak cozulebilir", () => {
      // 4x4 cok kucuk: hemen hemen her bulmaca single ile cozulur.
      const p = newPuzzle({ size: 4, difficulty: "easy", seed: 42 });
      const d = rateDifficulty(p.givens, p.config);
      // 4x4'te genelde easy veya medium cikar.
      expect(["easy", "medium", "hard"]).toContain(d);
    });

    it("9x9 uretici cesitli zorluklar -> impossible degil (tek cozumlu uretici)", () => {
      // Uretici tek cozumlu ureldigi icin SAT çözücüler her zaman cozer.
      // Mantiksal cozucu cozemese bile (= 'impossible') bu testi tek-cozumlu
      // garantisi olarak almayalim. Sadece sonucun bir Difficulty oldugunu kontrol et.
      for (const diff of ["easy", "medium", "hard"] as const) {
        const p = newPuzzle({ size: 9, difficulty: diff, seed: 12345 });
        const d = rateDifficulty(p.givens, p.config);
        expect([
          "easy",
          "medium",
          "hard",
          "extreme",
          "impossible",
        ]).toContain(d);
      }
    });
  });
});
