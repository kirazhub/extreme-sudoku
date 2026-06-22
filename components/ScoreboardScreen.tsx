"use client";

// Skorboard ekrani — zorluk + boyut basina en iyi sureler tablosu.
// Veriler localStorage'tan yuklenir (lib/game/scoreboard).

import { useMemo } from "react";
import { bestTimes, loadScores, type ScoreEntry } from "@/lib/game/scoreboard";
import { displayNameTR } from "@/lib/engine/difficulty";
import { formatTime } from "@/lib/game/useGameState";
import type { Difficulty } from "@/lib/engine";

export interface ScoreboardScreenProps {
  onBack: () => void;
}

const DIFFICULTIES: Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "extreme",
  "impossible",
];
const SIZES = [4, 6, 9, 16];

export function ScoreboardScreen({ onBack }: ScoreboardScreenProps) {
  // İlk render: localStorage senkron oku.
  const all = useMemo<ScoreEntry[]>(() => loadScores(), []);
  const best = useMemo(() => bestTimes(all), [all]);
  const hasAny = all.length > 0;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
          aria-label="Geri"
        >
          ← Geri
        </button>
        <h1
          className="text-2xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Skorboard
        </h1>
        <span className="w-12" />
      </header>

      {!hasAny ? (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <p
              className="text-2xl text-ink-soft"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Henüz kayıt yok
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Bir bulmaca tamamladığında en iyi süren burada görünür.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {DIFFICULTIES.map((d) => {
            // Bu zorlukta hiç kayıt yoksa bölümü atla.
            const rows = SIZES.map((s) => ({
              size: s,
              entry: best[`${d}:${s}`],
            })).filter((r) => r.entry);
            if (rows.length === 0) return null;

            return (
              <section key={d} className="rounded-2xl bg-surface border border-grid-thin p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {displayNameTR(d)}
                </h2>
                <div className="mt-2 divide-y divide-grid-thin">
                  {rows.map(({ size, entry }) => (
                    <div
                      key={size}
                      className="flex items-baseline justify-between py-2"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="tnum text-base font-semibold text-ink">
                          {size}×{size}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-lg font-semibold text-ink">
                          {formatTime(entry!.seconds)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-ink-soft">
                          {entry!.hintsUsed != null
                            ? `${entry!.hintsUsed} ipucu`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
