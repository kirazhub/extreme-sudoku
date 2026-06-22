"use client";

// Tek hucre. Stil disardan props ile gelir.
// - Eger value 0 ve notes verildiyse, kucuk grid halinde notlari gosterir.
// - isError true ise oyuncu girisi kirmizi gosterilir (verilen hucreler asla hata degildir).

import { symbolFor, valuesForSize } from "@/lib/game/symbols";

export interface CellViewProps {
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  isPeer: boolean;
  isSameValue: boolean;
  /** Bu hucredeki aday notlari (1..size). */
  notes?: number[];
  /** Hatali bir oyuncu girisi mi? */
  isError?: boolean;
  /** Tahta boyutu (font olceklemesi + not grid'i icin). */
  size: number;
  onSelect: () => void;
}

export function CellView({
  value,
  isGiven,
  isSelected,
  isPeer,
  isSameValue,
  notes,
  isError,
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
  // Hatali oyuncu girisi: accent (kirmizimsi mercan).
  let inkClass: string;
  if (isGiven) {
    inkClass = "text-ink font-bold";
  } else if (isError) {
    inkClass = "text-accent font-semibold";
  } else {
    inkClass = "text-ink-user font-semibold";
  }

  // Not gosterimi: degeri yoksa ve not varsa kucuk grid.
  const showNotes = value === 0 && notes && notes.length > 0;

  // Not grid duzeni: 4x4=2x2, 6x6=3x2 (sutun x satir), 9x9=3x3, 16x16=4x4.
  let notesCols = 3;
  let notesRows = 3;
  if (size === 4) {
    notesCols = 2;
    notesRows = 2;
  } else if (size === 6) {
    notesCols = 3;
    notesRows = 2;
  } else if (size === 16) {
    notesCols = 4;
    notesRows = 4;
  }

  const notesFontClass = size <= 6 ? "text-[10px]" : size === 9 ? "text-[10px]" : "text-[8px]";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Hucre ${symbolFor(value) || "bos"}`}
      className={`flex h-full w-full items-center justify-center select-none tnum transition-colors duration-100 ${bg} ${inkClass} ${fontClass} active:bg-accent/20`}
    >
      {showNotes ? (
        <div
          className={`grid h-full w-full text-ink-soft ${notesFontClass} leading-none`}
          style={{
            gridTemplateColumns: `repeat(${notesCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${notesRows}, minmax(0, 1fr))`,
          }}
        >
          {valuesForSize(size).slice(0, notesCols * notesRows).map((v) => (
            <span key={v} className="flex items-center justify-center">
              {notes!.includes(v) ? symbolFor(v) : ""}
            </span>
          ))}
        </div>
      ) : (
        symbolFor(value)
      )}
    </button>
  );
}
