"use client";

// Baslangic ekrani: (varsa) Devam Et + Gunluk bulmaca + zorluk + tahta boyutu + ipucu yogunlugu + BASLA.
// Saf gosterim; veri yonetimi yok, kullaniciya degerleri secip "onStart" tetikler.
// "Devam Et" kayit varsa en ustte gosterilir ve onResume() cagirir.

import { useState } from "react";
import type { Difficulty } from "@/lib/engine";
import { displayNameTR } from "@/lib/engine/difficulty";
import { useTheme } from "@/lib/game/useTheme";
import {
  isCompletedToday,
  loadDailyState,
  type DailyState,
} from "@/lib/game/daily";
import { loadSavedGame, type SavedGame } from "@/lib/game/savedGame";
import { formatTime } from "@/lib/game/useGameState";

export interface SetupChoice {
  size: number;
  difficulty: Difficulty;
  extraClues: number;
  /** True ise gunluk bulmaca; tohum dailySeed() ile sabitlenir. */
  isDaily?: boolean;
}

export interface SetupScreenProps {
  onStart: (choice: SetupChoice) => void;
  onShowScoreboard: () => void;
  /**
   * Kayitli yarim oyun varsa kullanicinin "Devam Et" karti.
   * Verildiyse ekranin en ustunde gosterilir.
   */
  onResume?: () => void;
  /** Kayitli yarim oyun ozet bilgisi — kartta gosterilir. */
  savedGame?: SavedGame | null;
}

const DIFFICULTIES: Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "extreme",
  "impossible",
];

const SIZES = [4, 6, 9, 16];

// Gunluk bulmaca sabit parametreleri — herkeste o gun ayni deneyim.
const DAILY_SIZE = 9;
const DAILY_DIFFICULTY: Difficulty = "hard";

export function SetupScreen({
  onStart,
  onShowScoreboard,
  onResume,
  savedGame,
}: SetupScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [size, setSize] = useState<number>(9);
  // -10..+15: sol -> daha az ipucu (zor), sag -> daha cok ipucu (kolay).
  const [extraClues, setExtraClues] = useState<number>(0);

  // Acik/koyu tema gecisi — ana ekrandan da erisilebilir.
  const { isDark, toggle: toggleTheme } = useTheme();

  // Gunluk seri durumu — lazy initial ile mount sirasinda localStorage'tan
  // okuruz. SSR'da window yok -> loadDailyState null doner; istemcide gercek
  // deger gelir. useEffect+setState pattern'i yerine bu yontem kullaniyoruz
  // ki React 19'un set-state-in-effect kuralina takilmayalim.
  const [daily] = useState<DailyState | null>(() => loadDailyState());

  // Yarim oyun: prop olarak gelirse onu kullan; yoksa lazy initial ile oku.
  // (page.tsx zaten verecek ama prop opsiyonel oldugundan fallback yapiyoruz.)
  const [localSaved] = useState<SavedGame | null>(() =>
    savedGame !== undefined ? savedGame : loadSavedGame()
  );
  const saved = savedGame !== undefined ? savedGame : localSaved;
  const hasSaved = !!saved && !!onResume;

  const dailyDone = isCompletedToday(daily);
  const streak = daily?.streak ?? 0;

  const startDaily = () => {
    onStart({
      size: DAILY_SIZE,
      difficulty: DAILY_DIFFICULTY,
      extraClues: 0,
      isDaily: true,
    });
  };

  // NOT: Turkce karakterli buyuk harfli basliklar icin Tailwind'in uppercase'i
  // yerine direkt buyuk harfli kaynak metin kullaniyoruz (text-transform Turkce'de
  // "i" → "I" yapip noktasiz büyük I üretir; biz "İ" istiyoruz).
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-7 px-5 py-8">
      <header className="pt-2 flex items-start justify-between">
        <div>
          <p className="text-ink-soft text-sm tracking-widest">
            TELEFONDA OYNA
          </p>
          <h1
            className="font-display text-5xl font-semibold leading-tight tracking-tight text-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Sudoku
            <br />
            <span className="text-accent">Ahmet</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-base active:bg-accent-soft"
            aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
            title={isDark ? "Açık tema" : "Koyu tema"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            type="button"
            onClick={onShowScoreboard}
            className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
            aria-label="Skorboard"
          >
            ★ Skorlar
          </button>
        </div>
      </header>

      {/* DEVAM ET karti — yalnizca kayitli yarim oyun varsa en ustte */}
      {hasSaved && saved && (
        <section>
          <button
            type="button"
            onClick={onResume}
            className="group w-full rounded-2xl border-2 border-accent bg-accent text-white p-4 text-left shadow-md transition-transform active:scale-[0.99]"
            aria-label="Yarım oyuna devam et"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">▶</div>
                <div>
                  <div
                    className="font-display text-xl font-semibold leading-tight"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    Devam Et
                  </div>
                  <div className="tnum text-xs opacity-90 mt-0.5">
                    {saved.size}×{saved.size} · {displayNameTR(saved.difficulty)} ·{" "}
                    {formatTime(saved.elapsedSeconds)}
                  </div>
                </div>
              </div>
              <div className="font-semibold">›</div>
            </div>

            {saved.isDaily && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-white/15 px-2.5 py-1 font-medium">
                  🗓️ Günlük
                </span>
              </div>
            )}
          </button>
        </section>
      )}

      {/* Gunluk bulmaca karti — tum kart tek bir buton */}
      <section>
        <button
          type="button"
          onClick={startDaily}
          className="group w-full rounded-2xl border-2 border-accent bg-accent-soft p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
          aria-label="Günlük bulmacayı oyna"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🗓️</div>
              <div>
                <div
                  className="font-display text-xl font-semibold text-ink leading-tight"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  Günlük Bulmaca
                </div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {DAILY_SIZE}×{DAILY_SIZE} · {displayNameTR(DAILY_DIFFICULTY)} · herkeste aynı
                </div>
              </div>
            </div>
            <div className="text-accent font-semibold">›</div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {streak > 0 && (
              <span className="tnum rounded-full bg-accent px-2.5 py-1 text-white font-semibold">
                🔥 {streak} günlük seri
              </span>
            )}
            {dailyDone && (
              <span className="rounded-full bg-surface border border-accent/40 px-2.5 py-1 text-accent font-medium">
                ✓ Bugünkü tamamlandı
              </span>
            )}
            {!dailyDone && streak === 0 && (
              <span className="text-ink-soft">
                Diziyi başlat — bugünkü bulmacayı çöz
              </span>
            )}
          </div>
        </button>
      </section>

      {/* Ayrac etiketi */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-grid-thin" />
        <span className="text-xs text-ink-soft tracking-widest">
          VEYA KENDİN SEÇ
        </span>
        <div className="h-px flex-1 bg-grid-thin" />
      </div>

      <section className="flex flex-col gap-3">
        <label className="text-sm font-medium text-ink-soft tracking-wider">
          ZORLUK
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((d) => {
            const active = d === difficulty;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`h-12 rounded-xl border font-medium transition-colors ${
                  active
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-surface text-ink border-grid-thin active:bg-accent-soft"
                }`}
              >
                {displayNameTR(d)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <label className="text-sm font-medium text-ink-soft tracking-wider">
          TAHTA BOYUTU
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`tnum h-12 rounded-xl border font-semibold transition-colors ${
                  active
                    ? "bg-ink text-bg border-ink shadow-sm"
                    : "bg-surface text-ink border-grid-thin active:bg-accent-soft"
                }`}
              >
                {s}×{s}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="extra-clues"
            className="text-sm font-medium text-ink-soft tracking-wider"
          >
            İPUCU YOĞUNLUĞU
          </label>
          <span className="tnum text-sm text-ink-soft">
            {extraClues > 0 ? `+${extraClues}` : extraClues}
          </span>
        </div>
        <input
          id="extra-clues"
          type="range"
          min={-10}
          max={15}
          step={1}
          value={extraClues}
          onChange={(e) => setExtraClues(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-ink-soft">
          <span>daha zor</span>
          <span>daha kolay</span>
        </div>
      </section>

      <div className="mt-auto pb-2">
        <button
          type="button"
          onClick={() => onStart({ size, difficulty, extraClues })}
          className="h-14 w-full rounded-2xl bg-accent text-white text-lg font-semibold shadow-md transition-transform active:scale-[0.98]"
        >
          BAŞLA
        </button>
      </div>
    </div>
  );
}
