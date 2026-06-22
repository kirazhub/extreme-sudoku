// Yerel skorboard — localStorage tabanli, SSR guvenli.
// Anahtar: extreme-sudoku-scores. Tum okuma/yazma saf yardimcilarda;
// React'ten bagimsiz oldugu icin test edilebilir.

import type { Difficulty } from "@/lib/engine";

/** Tek bir skor kaydi. */
export interface ScoreEntry {
  difficulty: Difficulty;
  size: number;
  seconds: number;
  dateISO: string;
  hintsUsed?: number;
}

/** En iyi sureleri zorluk+boyut anahtariyla doner. */
export type BestTimesMap = Record<string, ScoreEntry>;

const STORAGE_KEY = "extreme-sudoku-scores";

/** Bir kayit icin anahtar uretir (difficulty + size). */
export function scoreKey(difficulty: Difficulty, size: number): string {
  return `${difficulty}:${size}`;
}

/** SSR guvenli: window/localStorage var mi? */
function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Tum kayitlari oku. Bozuk JSON varsa bos dizi doner. */
export function loadScores(): ScoreEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Minimal dogrulama: gerekli alanlar var mi?
    return parsed.filter(
      (e): e is ScoreEntry =>
        e &&
        typeof e === "object" &&
        typeof e.difficulty === "string" &&
        typeof e.size === "number" &&
        typeof e.seconds === "number" &&
        typeof e.dateISO === "string"
    );
  } catch {
    return [];
  }
}

/** Tum kayitlari yaz. Hata olursa sessizce gec. */
function writeScores(scores: ScoreEntry[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Quota dolu vb. — sessiz gec.
  }
}

/** Yeni bir skoru kaydeder ve guncellenmis listeyi doner. */
export function saveScore(entry: ScoreEntry): ScoreEntry[] {
  const all = loadScores();
  all.push(entry);
  writeScores(all);
  return all;
}

/**
 * Her (difficulty+size) cifti icin en iyi (en kisa) sureyi doner.
 * Anahtar formati: "difficulty:size".
 */
export function bestTimes(scores?: ScoreEntry[]): BestTimesMap {
  const list = scores ?? loadScores();
  const map: BestTimesMap = {};
  for (const e of list) {
    const k = scoreKey(e.difficulty, e.size);
    const cur = map[k];
    if (!cur || e.seconds < cur.seconds) {
      map[k] = e;
    }
  }
  return map;
}

/**
 * Verilen sure, (difficulty+size) icin yeni rekor mu?
 * Kayit yapilmadan ONCE cagrilmali (mevcut en iyi ile karsilastirir).
 */
export function isNewRecord(
  difficulty: Difficulty,
  size: number,
  seconds: number,
  scores?: ScoreEntry[]
): boolean {
  const map = bestTimes(scores);
  const cur = map[scoreKey(difficulty, size)];
  if (!cur) return true;
  return seconds < cur.seconds;
}

/** Tum skorlari temizler (test/debug icin). */
export function clearScores(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessiz gec
  }
}
