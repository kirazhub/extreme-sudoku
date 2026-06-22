"use client";

// Oyun ekrani: header (zorluk + sure + duraklat + menu) + tahta + rakam paleti.

import { useGameState, formatTime } from "@/lib/game/useGameState";
import type { Puzzle } from "@/lib/engine";
import { displayNameTR } from "@/lib/engine/difficulty";
import { BoardView } from "./BoardView";
import { NumberPad } from "./NumberPad";

export interface GameScreenProps {
  puzzle: Puzzle;
  onExit: () => void;
}

export function GameScreen({ puzzle, onExit }: GameScreenProps) {
  const game = useGameState(puzzle);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-4 px-4 py-4">
      {/* Header: zorluk + sure + kontroller */}
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
          aria-label="Menuye don"
        >
          Menu
        </button>

        <div className="flex flex-col items-center">
          <p className="text-xs uppercase tracking-widest text-ink-soft">
            {displayNameTR(puzzle.difficulty)} · {puzzle.config.size}x
            {puzzle.config.size}
          </p>
          <p
            className="tnum text-2xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
          >
            {formatTime(game.elapsedSeconds)}
          </p>
        </div>

        <button
          type="button"
          onClick={game.togglePause}
          className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
          aria-label={game.isPaused ? "Devam et" : "Duraklat"}
        >
          {game.isPaused ? "Devam" : "Duraklat"}
        </button>
      </header>

      {/* Tahta */}
      <div className="relative">
        <BoardView
          config={puzzle.config}
          board={game.board}
          givens={puzzle.givens}
          selectedIndex={game.selectedIndex}
          onSelect={game.select}
        />
        {game.isPaused && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg/85 backdrop-blur-sm">
            <p
              className="text-2xl text-ink-soft"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              duraklatildi
            </p>
          </div>
        )}
        {game.isSolved && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg/90 backdrop-blur-sm">
            <div className="text-center">
              <p
                className="text-4xl font-semibold text-accent"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                tebrikler
              </p>
              <p className="mt-1 tnum text-ink-soft">
                {formatTime(game.elapsedSeconds)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rakam paleti */}
      <div className="mt-auto pb-2">
        <NumberPad
          size={puzzle.config.size}
          onInput={game.inputValue}
          onErase={game.erase}
          disabled={game.selectedIndex < 0 || game.isPaused || game.isSolved}
        />
      </div>
    </div>
  );
}
