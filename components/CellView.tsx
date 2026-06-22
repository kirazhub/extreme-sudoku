"use client";

// Tek hucre. Stil disardan className ile gelir; hucre saf gosterim.

import { symbolFor } from "@/lib/game/symbols";

export interface CellViewProps {
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  isPeer: boolean;
  isSameValue: boolean;
  /** Tahta boyutu (font olceklemesi icin). */
  size: number;
  onSelect: () => void;
}

export function CellView({
  value,
  isGiven,
  isSelected,
  isPeer,
  isSameValue,
  size,
  onSelect,
}: CellViewProps) {
  // Boyuta gore font olcegi: 9x9 normal, 16x16 daha kucuk.
  const fontClass =
    size <= 6
      ? "text-2xl md:text-3xl"
      : size === 9
        ? "text-xl md:text-2xl"
        : "text-sm md:text-base";

  // Arka plan oncelik sirasi: secili > ayni deger > peer > normal.
  let bg = "bg-surface";
  if (isSelected) bg = "bg-accent-soft";
  else if (isSameValue && value !== 0) bg = "bg-accent-soft/60";
  else if (isPeer) bg = "bg-cell-peer";

  // Renk: given kalin koyu, oyuncu girisi aksan-mavi.
  const inkClass = isGiven ? "text-ink font-bold" : "text-ink-user font-semibold";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Hucre ${symbolFor(value) || "bos"}`}
      className={`flex h-full w-full items-center justify-center select-none tnum transition-colors duration-100 ${bg} ${inkClass} ${fontClass} active:bg-accent/20`}
    >
      {symbolFor(value)}
    </button>
  );
}
