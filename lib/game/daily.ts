// Gunluk bulmaca seri (streak) yardimcilari — saf + SSR guvenli.
// localStorage anahtari: "extreme-sudoku-daily". Saklanan sekil:
//   { lastCompletedDate: "YYYY-MM-DD", streak: number }
// "Bugun" / "dun" tarihleri kullanicinin yerel saat dilimine gore hesaplanir
// (oyuncu kendi takvimine gore bir gun atlamis hisseder).

/** Gunluk seri durumu — localStorage'da JSON olarak saklanir. */
export interface DailyState {
  /** En son tamamlanan gunun YYYY-MM-DD bicimi (yerel saat). */
  lastCompletedDate: string;
  /** O zamana kadar ardisik (kesintisiz) gunluk seri sayisi. */
  streak: number;
}

const STORAGE_KEY = "extreme-sudoku-daily";

/** YYYY-MM-DD bicimi uretici — yerel takvime gore. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Verilen tarih (default: simdi) icin "bugun" anahtarini doner. */
export function todayKeyTR(date?: Date): string {
  return ymd(date ?? new Date());
}

/** Verilen tarihin bir gun oncesinin YYYY-MM-DD anahtarini doner. */
export function yesterdayKeyTR(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  d.setDate(d.getDate() - 1);
  return ymd(d);
}

/** Verilen durum, bugun zaten tamamlandi mi? */
export function isCompletedToday(
  state: DailyState | null,
  now?: Date
): boolean {
  if (!state) return false;
  return state.lastCompletedDate === todayKeyTR(now);
}

/**
 * Bugun bir gunluk bulmaca tamamlandi — yeni seri durumunu doner.
 * Kurallar:
 *  - prev=null veya gun > 1 fark -> streak=1 (yeniden baslat)
 *  - dun tamamlanmissa -> streak+=1
 *  - bugun zaten tamamlanmissa -> durum ayni kalir
 */
export function applyDailyCompletion(
  prev: DailyState | null,
  now?: Date
): DailyState {
  const today = todayKeyTR(now);
  const yesterday = yesterdayKeyTR(now);

  // Bugun zaten yapilmis — ayni durum.
  if (prev && prev.lastCompletedDate === today) {
    return prev;
  }

  // Dun yapilmis — seri devam ediyor.
  if (prev && prev.lastCompletedDate === yesterday) {
    return {
      lastCompletedDate: today,
      streak: prev.streak + 1,
    };
  }

  // Hic yapilmamis veya araya 1+ gun girmis — yeni seri.
  return {
    lastCompletedDate: today,
    streak: 1,
  };
}

/** SSR guvenli: window/localStorage erisilebilir mi? */
function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Durumu okur. Bozuk JSON veya yoksa null. */
export function loadDailyState(): DailyState | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.lastCompletedDate === "string" &&
      typeof parsed.streak === "number"
    ) {
      return parsed as DailyState;
    }
    return null;
  } catch {
    return null;
  }
}

/** Durumu kaydeder. Hata olursa sessizce gecer. */
export function saveDailyState(state: DailyState): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota dolu vb. — sessiz gec.
  }
}
