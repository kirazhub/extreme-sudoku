// Skorboard yardimcilari icin saf mantik testleri.
// localStorage'i taklit etmek icin minimal stub kullaniyoruz.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bestTimes,
  clearScores,
  isNewRecord,
  loadScores,
  saveScore,
  scoreKey,
  type ScoreEntry,
} from "../scoreboard";

// In-memory localStorage stub (Node + vitest icin).
function installStorage() {
  const store: Record<string, string> = {};
  const storage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: () => null,
    length: 0,
  };
  // jsdom yoksa window'u taklit et.
  vi.stubGlobal("window", { localStorage: storage });
}

describe("scoreboard", () => {
  beforeEach(() => {
    installStorage();
    clearScores();
  });

  it("scoreKey: difficulty:size formati", () => {
    expect(scoreKey("medium", 9)).toBe("medium:9");
  });

  it("loadScores: bos baslangic []", () => {
    expect(loadScores()).toEqual([]);
  });

  it("saveScore -> loadScores ile geri okunur", () => {
    const e: ScoreEntry = {
      difficulty: "easy",
      size: 4,
      seconds: 30,
      dateISO: "2026-01-01T00:00:00.000Z",
    };
    saveScore(e);
    expect(loadScores()).toEqual([e]);
  });

  it("bestTimes: ayni (zorluk,boyut) icin en kisa sureyi tutar", () => {
    saveScore({ difficulty: "hard", size: 9, seconds: 200, dateISO: "x" });
    saveScore({ difficulty: "hard", size: 9, seconds: 120, dateISO: "y" });
    saveScore({ difficulty: "hard", size: 9, seconds: 180, dateISO: "z" });
    const best = bestTimes();
    expect(best["hard:9"].seconds).toBe(120);
  });

  it("bestTimes: farkli (zorluk,boyut) ayri tutulur", () => {
    saveScore({ difficulty: "easy", size: 4, seconds: 10, dateISO: "a" });
    saveScore({ difficulty: "easy", size: 9, seconds: 50, dateISO: "b" });
    saveScore({ difficulty: "extreme", size: 9, seconds: 600, dateISO: "c" });
    const best = bestTimes();
    expect(Object.keys(best).sort()).toEqual([
      "easy:4",
      "easy:9",
      "extreme:9",
    ]);
  });

  it("isNewRecord: kayit yoksa true", () => {
    expect(isNewRecord("medium", 9, 100)).toBe(true);
  });

  it("isNewRecord: mevcut en iyiyi gectikten sonra true", () => {
    saveScore({ difficulty: "medium", size: 9, seconds: 200, dateISO: "x" });
    expect(isNewRecord("medium", 9, 150)).toBe(true);
    expect(isNewRecord("medium", 9, 250)).toBe(false);
    expect(isNewRecord("medium", 9, 200)).toBe(false);
  });

  it("bozuk JSON sessizce bos dizi olarak okunur", () => {
    // Direkt anahtara bozuk veri yaz.
    window.localStorage.setItem("extreme-sudoku-scores", "{not-json");
    expect(loadScores()).toEqual([]);
  });
});
