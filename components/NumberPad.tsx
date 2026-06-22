"use client";

// Alt kisimdaki rakam paleti. 1..size butonlari.
// Not modu aktifken paletin etrafinda accent cerceve gosterilir.

import { symbolFor, valuesForSize } from "@/lib/game/symbols";

export interface NumberPadProps {
  size: number;
  /** Bir rakam basildiginda. */
  onInput: (value: number) => void;
  /** Buton devre disi olsun mu? (hicbir hucre secili degilken). */
  disabled?: boolean;
  /** Not modu aktifse paleti gorsel olarak farklilastir. */
  noteMode?: boolean;
}

export function NumberPad({ size, onInput, disabled, noteMode }: NumberPadProps) {
  const values = valuesForSize(size);

  // 16x16 icin 2 satira sar; digerleri tek satir.
  const cols = size <= 9 ? size : 8;

  return (
    <div
      className={`w-full rounded-2xl p-1 transition-colors ${
        noteMode ? "ring-2 ring-accent/60 bg-accent-soft/40" : ""
      }`}
    >
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
    </div>
  );
}
