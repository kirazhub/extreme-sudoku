import { describe, it, expect } from "vitest";
import {
  configForSize,
  index,
  rowOf,
  colOf,
  boxIndexOf,
  peersOf,
  units,
} from "../geometry";

describe("geometry", () => {
  describe("configForSize", () => {
    it("4x4 -> 2 satir x 2 sutun kutu", () => {
      const c = configForSize(4);
      expect(c.size).toBe(4);
      expect(c.boxRows).toBe(2);
      expect(c.boxCols).toBe(2);
    });

    it("6x6 -> 2 satir x 3 sutun kutu", () => {
      const c = configForSize(6);
      expect(c.size).toBe(6);
      expect(c.boxRows).toBe(2);
      expect(c.boxCols).toBe(3);
    });

    it("9x9 -> 3 satir x 3 sutun kutu", () => {
      const c = configForSize(9);
      expect(c.size).toBe(9);
      expect(c.boxRows).toBe(3);
      expect(c.boxCols).toBe(3);
    });

    it("16x16 -> 4 satir x 4 sutun kutu", () => {
      const c = configForSize(16);
      expect(c.size).toBe(16);
      expect(c.boxRows).toBe(4);
      expect(c.boxCols).toBe(4);
    });

    it("desteklenmeyen boyut hata firlatir", () => {
      expect(() => configForSize(5)).toThrow();
    });
  });

  describe("index / rowOf / colOf", () => {
    it("9x9 (3,4) -> indeks 31 ve geri", () => {
      const idx = index(3, 4, 9);
      expect(idx).toBe(3 * 9 + 4);
      expect(rowOf(idx, 9)).toBe(3);
      expect(colOf(idx, 9)).toBe(4);
    });

    it("16x16 son hucre dogru", () => {
      const idx = index(15, 15, 16);
      expect(idx).toBe(255);
      expect(rowOf(idx, 16)).toBe(15);
      expect(colOf(idx, 16)).toBe(15);
    });
  });

  describe("boxIndexOf", () => {
    it("9x9 (0,0) kutu 0, (4,4) kutu 4, (8,8) kutu 8", () => {
      const c = configForSize(9);
      expect(boxIndexOf(0, 0, c)).toBe(0);
      expect(boxIndexOf(4, 4, c)).toBe(4);
      expect(boxIndexOf(8, 8, c)).toBe(8);
    });

    it("6x6 (boxRows=2,boxCols=3) (0,0)=0, (0,5)=1, (5,5)=5", () => {
      const c = configForSize(6);
      // satir 0,1 + sutun 0,1,2 -> kutu 0
      // satir 0,1 + sutun 3,4,5 -> kutu 1
      // satir 4,5 + sutun 3,4,5 -> kutu 5
      expect(boxIndexOf(0, 0, c)).toBe(0);
      expect(boxIndexOf(0, 5, c)).toBe(1);
      expect(boxIndexOf(5, 5, c)).toBe(5);
    });

    it("4x4 (0,0)=0, (1,1)=0, (2,2)=3, (3,0)=2", () => {
      const c = configForSize(4);
      expect(boxIndexOf(0, 0, c)).toBe(0);
      expect(boxIndexOf(1, 1, c)).toBe(0);
      expect(boxIndexOf(2, 2, c)).toBe(3);
      expect(boxIndexOf(3, 0, c)).toBe(2);
    });
  });

  describe("peersOf", () => {
    it("9x9 her hucrenin 20 peer'i var", () => {
      const c = configForSize(9);
      const peers = peersOf(index(4, 4, 9), c);
      expect(peers.size).toBe(20);
      // kendisi yok
      expect(peers.has(index(4, 4, 9))).toBe(false);
    });

    it("4x4 her hucrenin 7 peer'i var (3 satir + 3 sutun + 1 farkli kutu = 7)", () => {
      // 4x4'te satir = 4 hucre (3 diger), sutun 3 diger, kutu 3 diger
      // ama kutudaki digerlerin 2'si zaten satir/sutunda. Net = 3+3+1 = 7? hesaplayalim:
      // (0,0) icin peerler: (0,1),(0,2),(0,3) satir; (1,0),(2,0),(3,0) sutun; (1,1) kutu (digerleri zaten var)
      // toplam 7
      const c = configForSize(4);
      const peers = peersOf(index(0, 0, 4), c);
      expect(peers.size).toBe(7);
    });
  });

  describe("units", () => {
    it("9x9'da 27 unit (9 satir + 9 sutun + 9 kutu)", () => {
      const c = configForSize(9);
      const u = units(c);
      expect(u.length).toBe(27);
      // her unit 9 hucre
      for (const unit of u) expect(unit.length).toBe(9);
    });

    it("4x4'te 12 unit", () => {
      const c = configForSize(4);
      const u = units(c);
      expect(u.length).toBe(12);
      for (const unit of u) expect(unit.length).toBe(4);
    });
  });
});
