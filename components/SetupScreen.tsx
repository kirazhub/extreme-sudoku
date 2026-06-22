"use client";

// Baslangic ekrani: zorluk + tahta boyutu + ipucu yogunlugu + BASLA.
// Saf gosterim; veri yonetimi yok, kullaniciya degerleri secip "onStart" tetikler.

import { useState } from "react";
import type { Difficulty } from "@/lib/engine";
import { displayNameTR } from "@/lib/engine/difficulty";

export interface SetupChoice {
  size: number;
  difficulty: Difficulty;
  extraClues: number;
}

export interface SetupScreenProps {
  onStart: (choice: SetupChoice) => void;
  onShowScoreboard: () => void;
}

const DIFFICULTIES: Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "extreme",
  "impossible",
];

const SIZES = [4, 6, 9, 16];

export function SetupScreen({ onStart, onShowScoreboard }: SetupScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [size, setSize] = useState<number>(9);
  // -10..+15: sol -> daha az ipucu (zor), sag -> daha cok ipucu (kolay).
  const [extraClues, setExtraClues] = useState<number>(0);

  // NOT: Turkce karakterli buyuk harfli basliklar icin Tailwind'in uppercase'i
  // yerine direkt buyuk harfli kaynak metin kullaniyoruz (text-transform Turkce'de
  // "i" → "I" yapip noktasiz büyük I üretir; biz "İ" istiyoruz).
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-8 px-5 py-8">
      <header className="pt-2 flex items-start justify-between">
        <div>
          <p className="text-ink-soft text-sm tracking-widest">
            TELEFONDA OYNA
          </p>
          <h1
            className="font-display text-5xl font-semibold leading-tight tracking-tight text-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Extreme
            <br />
            <span className="text-accent">Sudoku</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={onShowScoreboard}
          className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
          aria-label="Skorboard"
        >
          ★ Skorlar
        </button>
      </header>

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
