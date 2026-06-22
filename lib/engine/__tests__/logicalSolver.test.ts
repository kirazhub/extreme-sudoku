import { describe, it, expect } from "vitest";
import { nextHint } from "../logicalSolver";
import { configForSize, index } from "../geometry";
import { createEmpty } from "../board";

describe("logicalSolver", () => {
  describe("nakedSingle", () => {
    it("4x4: (0,0) hucresinde tek aday 1 oldugunda nakedSingle doner", () => {
      const c = configForSize(4);
      const g = createEmpty(c);
      // (0,1)=2, (0,2)=3 -> satir 2,3 elendi
      // (1,0)=4 -> sutun 4 elendi
      // (0,0) icin tek aday 1
      g[index(0, 1, 4)] = 2;
      g[index(0, 2, 4)] = 3;
      g[index(1, 0, 4)] = 4;

      const hint = nextHint(g, c);
      expect(hint).not.toBeNull();
      expect(hint!.technique).toBe("nakedSingle");
      expect(hint!.index).toBe(index(0, 0, 4));
      expect(hint!.value).toBe(1);
      expect(typeof hint!.explanationTR).toBe("string");
      expect(hint!.explanationTR.length).toBeGreaterThan(0);
    });
  });

  describe("hiddenSingle", () => {
    it("4x4: satir 0'da 1 sadece (0,3)'e konabilir", () => {
      const c = configForSize(4);
      const g = createEmpty(c);
      // sutun 0,1,2'de 1 var -> satir 0'da 1 sadece (0,3) hucresine
      g[index(1, 0, 4)] = 1;
      g[index(2, 1, 4)] = 1;
      g[index(3, 2, 4)] = 1;

      const hint = nextHint(g, c);
      expect(hint).not.toBeNull();
      // Bu senaryoda baska hucrelerde naked single OLMAMALI - aksi halde naked once gelir.
      // Doogrulayalim: hint nakedSingle ise testin onceki kontrolu basarisiz olur,
      // ama spesifik olarak hiddenSingle gelmesini bekleyelim:
      expect(hint!.technique).toBe("hiddenSingle");
      expect(hint!.index).toBe(index(0, 3, 4));
      expect(hint!.value).toBe(1);
      expect(hint!.explanationTR.length).toBeGreaterThan(0);
    });
  });

  it("bos grid -> hint yok (null)", () => {
    const c = configForSize(9);
    const g = createEmpty(c);
    const hint = nextHint(g, c);
    expect(hint).toBeNull();
  });
});
