"use client";

// Sudoku tahtasi: N x N grid + kutu sinirlarinda kalin ayrac cizgileri.
// Yaklasim: dis arka plan grid-thick rengi, hucreler arasi 1px bosluk;
// kutu sinirlarinda 2px bosluk vererek kalin cizgi etkisi olusturulur.

import { CellView } from "./CellView";
import type { GameConfig } from "@/lib/engine";
import { peersOf } from "@/lib/engine/geometry";

export interface BoardViewProps {
  config: GameConfig;
  /** Anki tahta. */
  board: number[];
  /** Givens dizisi (kilitli hucreler tespiti). */
  givens: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function BoardView({
  config,
  board,
  givens,
  selectedIndex,
  onSelect,
}: BoardViewProps) {
  const { size, boxRows, boxCols } = config;

  // Secili hucrenin peer'leri ve degeri (vurgu icin).
  const peers =
    selectedIndex >= 0 ? peersOf(selectedIndex, config) : new Set<number>();
  const selectedValue = selectedIndex >= 0 ? board[selectedIndex] : 0;

  return (
    <div
      className="aspect-square w-full rounded-xl bg-grid-thick p-[2px] shadow-sm overflow-hidden"
      role="grid"
      aria-label={`Sudoku ${size}x${size}`}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          // Hucreler arasi varsayilan boslugu 0 yapip kenarliklarla cizgi cizecegiz.
          gap: 0,
        }}
      >
        {board.map((value, i) => {
          const row = Math.floor(i / size);
          const col = i % size;

          // Her hucrenin sag ve alt kenarliklari: kutu sinirinda kalin.
          const thickRight =
            col !== size - 1 && (col + 1) % boxCols === 0;
          const thickBottom =
            row !== size - 1 && (row + 1) % boxRows === 0;
          const thinRight = col !== size - 1 && !thickRight;
          const thinBottom = row !== size - 1 && !thickBottom;

          const borderStyle: React.CSSProperties = {
            borderRightWidth: thickRight ? 2 : thinRight ? 1 : 0,
            borderBottomWidth: thickBottom ? 2 : thinBottom ? 1 : 0,
            borderRightColor: thickRight
              ? "var(--color-grid-thick)"
              : "var(--color-grid-thin)",
            borderBottomColor: thickBottom
              ? "var(--color-grid-thick)"
              : "var(--color-grid-thin)",
          };

          return (
            <div key={i} style={borderStyle} className="relative">
              <CellView
                value={value}
                isGiven={givens[i] !== 0}
                isSelected={selectedIndex === i}
                isPeer={peers.has(i)}
                isSameValue={
                  value !== 0 &&
                  selectedValue !== 0 &&
                  value === selectedValue
                }
                size={size}
                onSelect={() => onSelect(i)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
