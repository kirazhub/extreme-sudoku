// Yarim oyun kalici saklama — localStorage tabanli, SSR guvenli.
// Anahtar: "sudoku-ahmet-saved".
// Tum okuma/yazma saf yardimcilarda; React'ten bagimsiz oldugu icin test edilebilir.
//
// Saklanan veri yapisi tam olarak bir oyunu yeniden kurmak icin yeterlidir:
// - size + difficulty + isDaily: yeni Puzzle'i ayni config ile yeniden olusturmak icin
// - givens + solution: Puzzle'in degismez kismi (her seferinde solver calistirmaktan kaciniyoruz)
// - board + notes + elapsedSeconds + hintsUsed + selectedIndex: oyuncunun anlik durumu

import type { Difficulty } from "@/lib/engine";

/** Kaydedilmis yarim oyun. */
export interface SavedGame {
  size: number;
  difficulty: Difficulty;
  isDaily: boolean;
  givens: number[];
  solution: number[];
  board: number[];
  /** Hucre indeksi -> aday rakamlar dizisi (sirali). */
  notes: Record<number, number[]>;
  elapsedSeconds: number;
  hintsUsed: number;
  /** Yeniden acildiginda hangi hucre seciliydi (-1 veya null = secim yoktu). */
  selectedIndex: number | null;
  /** Kaydedildigi an (epoch ms). */
  savedAt: number;
}

const STORAGE_KEY = "sudoku-ahmet-saved";

/** SSR guvenli: window/localStorage erisilebilir mi? */
function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Kaydet — bozuk veri icin saklamayi denemez (cagiran guvenmeli). */
export function saveGame(s: SavedGame): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Quota dolu vb. — sessiz gec.
  }
}

/** Sadece bir kaydin var olup olmadigini soyler (icini ayristirmaz). */
export function hasSavedGame(): boolean {
  if (!hasStorage()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Kaydi siler — sessizce gecer. */
export function clearSavedGame(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessiz gec
  }
}

/**
 * Saklanan veri bir SavedGame mi?
 * - Gerekli alanlar var ve tip dogru
 * - Dizi uzunluklari size*size'a esit (bozuk veri korumasi)
 * - Notlar Record<number, number[]> sekline uyuyor
 */
function isValid(v: unknown): v is SavedGame {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;

  if (typeof s.size !== "number" || s.size <= 0) return false;
  if (typeof s.difficulty !== "string") return false;
  if (typeof s.isDaily !== "boolean") return false;
  if (!Array.isArray(s.givens) || !Array.isArray(s.solution) || !Array.isArray(s.board)) {
    return false;
  }

  const expectedLen = s.size * s.size;
  if (
    s.givens.length !== expectedLen ||
    s.solution.length !== expectedLen ||
    s.board.length !== expectedLen
  ) {
    return false;
  }

  // Sayisal degerler mi?
  for (const arr of [s.givens, s.solution, s.board] as number[][]) {
    for (const n of arr) {
      if (typeof n !== "number" || !Number.isFinite(n)) return false;
    }
  }

  if (typeof s.elapsedSeconds !== "number" || s.elapsedSeconds < 0) return false;
  if (typeof s.hintsUsed !== "number" || s.hintsUsed < 0) return false;
  if (s.selectedIndex !== null && typeof s.selectedIndex !== "number") return false;
  if (typeof s.savedAt !== "number") return false;

  // Notes: Record<number, number[]>
  if (!s.notes || typeof s.notes !== "object" || Array.isArray(s.notes)) return false;
  for (const [k, val] of Object.entries(s.notes)) {
    const idx = Number(k);
    if (!Number.isFinite(idx)) return false;
    if (!Array.isArray(val)) return false;
    for (const n of val) {
      if (typeof n !== "number") return false;
    }
  }

  return true;
}

/**
 * Kaydi okur. Yoksa veya bozuksa null doner ve bozuk kayit otomatik temizlenir.
 */
export function loadSavedGame(): SavedGame | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) {
      // Bozuk veriyi temizle ki uygulamanin sonraki cagrilari da bos donsun.
      clearSavedGame();
      return null;
    }
    // notes anahtarlarini number'a cevir (JSON.parse string yapiyor).
    const notes: Record<number, number[]> = {};
    for (const [k, v] of Object.entries(parsed.notes)) {
      notes[Number(k)] = (v as number[]).slice();
    }
    return {
      size: parsed.size,
      difficulty: parsed.difficulty,
      isDaily: parsed.isDaily,
      givens: parsed.givens.slice(),
      solution: parsed.solution.slice(),
      board: parsed.board.slice(),
      notes,
      elapsedSeconds: parsed.elapsedSeconds,
      hintsUsed: parsed.hintsUsed,
      selectedIndex: parsed.selectedIndex,
      savedAt: parsed.savedAt,
    };
  } catch {
    // Bozuk JSON vb. — temizle, null don.
    clearSavedGame();
    return null;
  }
}
