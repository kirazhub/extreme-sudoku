"use client";

// Alt kisimdaki rakam paleti. 1..size butonlari + Sil.

import { symbolFor, valuesForSize } from "@/lib/game/symbols";

export interface NumberPadProps {
  size: number;
  /** Bir rakam basildiginda. */
  onInput: (value: number) => void;
  /** Sil butonu basildiginda. */
  onErase: () => void;
  /** Buton devre disi olsun mu? (hicbir hucre secili degilken). */
  disabled?: boolean;
}

export function NumberPad({ size, onInput, onErase, disabled }: NumberPadProps) {
  const values = valuesForSize(size);

  // 16x16 icin 2 satira sar; digerleri tek satir.
  const cols = size <= 9 ? size : 8;

  return (
    <div className="w-full">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {values.map((v) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => onInput(v)}
            className="tnum h-12 rounded-xl bg-surface text-ink-user font-semibold text-lg shadow-sm border border-grid-thin transition-colors active:bg-accent-soft disabled:opacity-40 disabled:active:bg-surface"
            aria-label={`Rakam ${symbolFor(v)}`}
          >
            {symbolFor(v)}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onErase}
        className="mt-2 h-11 w-full rounded-xl bg-surface text-ink-soft font-medium border border-grid-thin transition-colors active:bg-accent-soft disabled:opacity-40"
      >
        Sil
      </button>
    </div>
  );
}
