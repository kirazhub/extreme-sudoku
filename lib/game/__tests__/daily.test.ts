// Gunluk bulmaca seri (streak) yardimcilari icin saf mantik testleri.
// Tarih bagimliligi olan fonksiyonlara dis tarih veriyoruz (deterministik).

import { beforeEach, describe, expect, it } from "vitest";
import {
  applyDailyCompletion,
  isCompletedToday,
  loadDailyState,
  saveDailyState,
  todayKeyTR,
  type DailyState,
  yesterdayKeyTR,
} from "../daily";

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
  // @ts-expect-error window stub
  globalThis.window = { localStorage: storage };
}

beforeEach(() => {
  installStorage();
});

describe("todayKeyTR / yesterdayKeyTR", () => {
  it("YYYY-MM-DD bicimini dondurur", () => {
    const d = new Date(2025, 4, 9); // 9 Mayis 2025 (yerel saat)
    expect(todayKeyTR(d)).toBe("2025-05-09");
  });

  it("yesterday bir gun once verir", () => {
    const d = new Date(2025, 4, 9);
    expect(yesterdayKeyTR(d)).toBe("2025-05-08");
  });

  it("ay/yil donumlerinde dogru sekilde geri sayar", () => {
    const newYear = new Date(2025, 0, 1);
    expect(yesterdayKeyTR(newYear)).toBe("2024-12-31");
  });
});

describe("applyDailyCompletion", () => {
  it("ilk tamamlamada streak=1 yapar", () => {
    const today = new Date(2025, 5, 15);
    const next = applyDailyCompletion(null, today);
    expect(next.streak).toBe(1);
    expect(next.lastCompletedDate).toBe("2025-06-15");
  });

  it("dun tamamlandiysa streak'i artirir", () => {
    const today = new Date(2025, 5, 15);
    const prev: DailyState = {
      lastCompletedDate: "2025-06-14",
      streak: 3,
    };
    const next = applyDailyCompletion(prev, today);
    expect(next.streak).toBe(4);
    expect(next.lastCompletedDate).toBe("2025-06-15");
  });

  it("bugun zaten tamamlandiysa hicbir sey degismez", () => {
    const today = new Date(2025, 5, 15);
    const prev: DailyState = {
      lastCompletedDate: "2025-06-15",
      streak: 7,
    };
    const next = applyDailyCompletion(prev, today);
    expect(next.streak).toBe(7);
    expect(next.lastCompletedDate).toBe("2025-06-15");
  });

  it("iki gun veya daha eski tamamlamadan sonra streak=1'e sifirlanir", () => {
    const today = new Date(2025, 5, 15);
    const prev: DailyState = {
      lastCompletedDate: "2025-06-10", // 5 gun once
      streak: 10,
    };
    const next = applyDailyCompletion(prev, today);
    expect(next.streak).toBe(1);
    expect(next.lastCompletedDate).toBe("2025-06-15");
  });
});

describe("isCompletedToday", () => {
  it("durum yoksa false", () => {
    const today = new Date(2025, 5, 15);
    expect(isCompletedToday(null, today)).toBe(false);
  });

  it("tarih bugune esitse true", () => {
    const today = new Date(2025, 5, 15);
    const state: DailyState = {
      lastCompletedDate: "2025-06-15",
      streak: 2,
    };
    expect(isCompletedToday(state, today)).toBe(true);
  });

  it("tarih dune aitse false", () => {
    const today = new Date(2025, 5, 15);
    const state: DailyState = {
      lastCompletedDate: "2025-06-14",
      streak: 2,
    };
    expect(isCompletedToday(state, today)).toBe(false);
  });
});

describe("load/save round-trip", () => {
  it("null verisi olmadiginda null doner", () => {
    expect(loadDailyState()).toBeNull();
  });

  it("kayit edilen durumu okuyabilir", () => {
    const state: DailyState = {
      lastCompletedDate: "2025-06-15",
      streak: 5,
    };
    saveDailyState(state);
    expect(loadDailyState()).toEqual(state);
  });

  it("bozuk JSON varsa null doner", () => {
    // @ts-expect-error window stub
    globalThis.window.localStorage.setItem("extreme-sudoku-daily", "bozuk{");
    expect(loadDailyState()).toBeNull();
  });
});
