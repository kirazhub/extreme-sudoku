// Yarim oyun kalici saklama icin saf mantik testleri.
// localStorage'i taklit etmek icin minimal in-memory stub kullaniyoruz.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSavedGame,
  hasSavedGame,
  loadSavedGame,
  saveGame,
  type SavedGame,
} from "../savedGame";

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
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

// Hazir 4x4 ornek kayit — testlerde tekrar tekrar kullanilacak.
function sampleSaved(): SavedGame {
  return {
    size: 4,
    difficulty: "easy",
    isDaily: false,
    givens: [1, 0, 0, 4, 0, 0, 1, 0, 0, 1, 0, 0, 4, 0, 0, 1],
    solution: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1],
    board: [1, 0, 3, 4, 0, 0, 1, 0, 0, 1, 0, 0, 4, 0, 0, 1],
    notes: { 1: [2, 4], 5: [3] },
    elapsedSeconds: 42,
    hintsUsed: 1,
    selectedIndex: 5,
    savedAt: 1700000000000,
  };
}

describe("savedGame", () => {
  beforeEach(() => {
    installStorage();
    clearSavedGame();
  });

  it("loadSavedGame: bos baslangic null", () => {
    expect(loadSavedGame()).toBeNull();
  });

  it("hasSavedGame: kayit yokken false", () => {
    expect(hasSavedGame()).toBe(false);
  });

  it("saveGame -> loadSavedGame ile geri okunur", () => {
    const s = sampleSaved();
    saveGame(s);
    const loaded = loadSavedGame();
    expect(loaded).toEqual(s);
  });

  it("saveGame sonrasi hasSavedGame true", () => {
    saveGame(sampleSaved());
    expect(hasSavedGame()).toBe(true);
  });

  it("clearSavedGame siler", () => {
    saveGame(sampleSaved());
    expect(hasSavedGame()).toBe(true);
    clearSavedGame();
    expect(hasSavedGame()).toBe(false);
    expect(loadSavedGame()).toBeNull();
  });

  it("notes anahtarlari number olarak doner (JSON string'lerden cevriliyor)", () => {
    saveGame(sampleSaved());
    const loaded = loadSavedGame()!;
    // Object.keys her zaman string doner, ama anahtarlari Number ile karsilastiralim.
    expect(loaded.notes[1]).toEqual([2, 4]);
    expect(loaded.notes[5]).toEqual([3]);
  });

  it("immutable: load sonrasi mutasyon orijinali bozmaz", () => {
    saveGame(sampleSaved());
    const a = loadSavedGame()!;
    a.board[0] = 99;
    const b = loadSavedGame()!;
    expect(b.board[0]).toBe(1);
  });

  it("bozuk JSON sessizce temizlenir ve null doner", () => {
    window.localStorage.setItem("sudoku-ahmet-saved", "{not-json");
    expect(loadSavedGame()).toBeNull();
    // Otomatik temizlendi mi?
    expect(hasSavedGame()).toBe(false);
  });

  it("dogrulama: givens uzunlugu size*size degilse null + temizlenir", () => {
    const bad = sampleSaved();
    bad.givens = [1, 2, 3]; // 4x4 icin 16 olmali
    window.localStorage.setItem("sudoku-ahmet-saved", JSON.stringify(bad));
    expect(loadSavedGame()).toBeNull();
    expect(hasSavedGame()).toBe(false);
  });

  it("dogrulama: solution uzunlugu yanlissa null", () => {
    const bad = sampleSaved();
    bad.solution = [1, 2];
    window.localStorage.setItem("sudoku-ahmet-saved", JSON.stringify(bad));
    expect(loadSavedGame()).toBeNull();
  });

  it("dogrulama: board uzunlugu yanlissa null", () => {
    const bad = sampleSaved();
    bad.board = [1, 2, 3, 4]; // 4x4 icin 16 olmali
    window.localStorage.setItem("sudoku-ahmet-saved", JSON.stringify(bad));
    expect(loadSavedGame()).toBeNull();
  });

  it("dogrulama: eksik alan varsa null", () => {
    const bad = { size: 4, difficulty: "easy" }; // cogu alan eksik
    window.localStorage.setItem("sudoku-ahmet-saved", JSON.stringify(bad));
    expect(loadSavedGame()).toBeNull();
  });

  it("dogrulama: notes Array gibi gelirse null", () => {
    const bad = sampleSaved() as unknown as Record<string, unknown>;
    bad.notes = [1, 2, 3];
    window.localStorage.setItem("sudoku-ahmet-saved", JSON.stringify(bad));
    expect(loadSavedGame()).toBeNull();
  });

  it("dogrulama: notes degerleri dizi degilse null", () => {
    const bad = sampleSaved() as unknown as Record<string, unknown>;
    bad.notes = { 1: "not-an-array" };
    window.localStorage.setItem("sudoku-ahmet-saved", JSON.stringify(bad));
    expect(loadSavedGame()).toBeNull();
  });

  it("selectedIndex null kabul edilir", () => {
    const s = sampleSaved();
    s.selectedIndex = null;
    saveGame(s);
    const loaded = loadSavedGame();
    expect(loaded?.selectedIndex).toBeNull();
  });

  it("isDaily true bayragi korunur", () => {
    const s = sampleSaved();
    s.isDaily = true;
    saveGame(s);
    expect(loadSavedGame()?.isDaily).toBe(true);
  });

  it("9x9 ornegi: size*size dogrulamasi 81'i kabul eder", () => {
    const g = new Array(81).fill(0);
    const sol = new Array(81).fill(1);
    const b = new Array(81).fill(0);
    const s: SavedGame = {
      size: 9,
      difficulty: "medium",
      isDaily: false,
      givens: g,
      solution: sol,
      board: b,
      notes: {},
      elapsedSeconds: 100,
      hintsUsed: 0,
      selectedIndex: null,
      savedAt: 1700000000000,
    };
    saveGame(s);
    expect(loadSavedGame()).toEqual(s);
  });
});
