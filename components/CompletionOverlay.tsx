"use client";

// Tamamlama overlayi: "Tamamlandı!" + sure + ipucu sayisi + (varsa) yeni rekor.
// Konfeti birden cok dalga halinde patlar. Yumuşak fade+scale ile acilir.

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { formatTime } from "@/lib/game/useGameState";

export interface CompletionOverlayProps {
  elapsedSeconds: number;
  hintsUsed: number;
  isNewRecord: boolean;
  onPlayAgain: () => void;
  onMenu: () => void;
  onShowScoreboard: () => void;
}

export function CompletionOverlay({
  elapsedSeconds,
  hintsUsed,
  isNewRecord,
  onPlayAgain,
  onMenu,
  onShowScoreboard,
}: CompletionOverlayProps) {
  useEffect(() => {
    // Coskulu konfeti — birkaç dalga. Renkler accent + tamamlayicilar.
    const colors = ["#F0502E", "#FBE3D6", "#2E6E8E", "#FBF8F1", "#23272E"];

    // Dalga 1: merkez
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { x: 0.5, y: 0.45 },
      colors,
      scalar: 1.05,
    });

    // Dalga 2: sol alttan
    const t1 = window.setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
    }, 250);

    // Dalga 3: sag alttan
    const t2 = window.setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });
    }, 450);

    // Dalga 4: yagmur efekti
    const t3 = window.setTimeout(() => {
      confetti({
        particleCount: 120,
        startVelocity: 25,
        spread: 360,
        origin: { x: 0.5, y: 0 },
        colors,
        gravity: 0.7,
        scalar: 0.9,
      });
    }, 700);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm px-5 animate-[fadeIn_220ms_ease-out]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div
        className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl text-center border border-grid-thin animate-[popIn_280ms_cubic-bezier(0.2,0.9,0.3,1.15)]"
      >
        <p className="text-sm uppercase tracking-widest text-ink-soft">
          Tebrikler
        </p>
        <h2
          className="mt-1 text-4xl font-semibold text-accent leading-tight"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Tamamlandı!
        </h2>

        {isNewRecord && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
            <span aria-hidden>★</span> Yeni rekor!
          </div>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-bg p-3">
            <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
              Süre
            </dt>
            <dd className="mt-0.5 tnum text-2xl font-semibold text-ink">
              {formatTime(elapsedSeconds)}
            </dd>
          </div>
          <div className="rounded-2xl bg-bg p-3">
            <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
              İpucu
            </dt>
            <dd className="mt-0.5 tnum text-2xl font-semibold text-ink">
              {hintsUsed}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="h-12 w-full rounded-2xl bg-accent text-white font-semibold shadow-md transition-transform active:scale-[0.98]"
          >
            Tekrar Oyna
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onShowScoreboard}
              className="h-11 rounded-xl border border-grid-thin bg-surface text-ink font-medium active:bg-accent-soft"
            >
              Skorboard
            </button>
            <button
              type="button"
              onClick={onMenu}
              className="h-11 rounded-xl border border-grid-thin bg-surface text-ink font-medium active:bg-accent-soft"
            >
              Menü
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
