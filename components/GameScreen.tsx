"use client";

// Oyun ekrani: header (menu + sure + ayarlar) + tahta + ipucu seridi
// + arac cubugu (Geri Al, Sil, Not, Ipucu) + rakam paleti.
// Tamamlama overlayini ve haptik geribildirimi burada tetikleriz.

import { useEffect, useRef, useState } from "react";
import { useGameState, formatTime } from "@/lib/game/useGameState";
import type { Puzzle } from "@/lib/engine";
import { displayNameTR } from "@/lib/engine/difficulty";
import { BoardView } from "./BoardView";
import { NumberPad } from "./NumberPad";
import { Toolbar } from "./Toolbar";
import { CompletionOverlay } from "./CompletionOverlay";
import { SettingsSheet } from "./SettingsSheet";
import { vibrateShort, vibrateSuccess } from "@/lib/game/haptics";
import {
  isNewRecord as scoreIsNewRecord,
  saveScore,
} from "@/lib/game/scoreboard";
import {
  applyDailyCompletion,
  loadDailyState,
  saveDailyState,
} from "@/lib/game/daily";
import type { SavedGame } from "@/lib/game/savedGame";

export interface GameScreenProps {
  puzzle: Puzzle;
  /** Gunluk bulmaca mi? Tamamlamada seri (streak) guncellenir. */
  isDaily?: boolean;
  /** Verildiyse kayitli yarim oyundan baslar (board/notes/sure/ipucu). */
  restore?: SavedGame | null;
  onExit: () => void;
  onPlayAgain: () => void;
  onShowScoreboard: () => void;
}

export function GameScreen({
  puzzle,
  isDaily = false,
  restore = null,
  onExit,
  onPlayAgain,
  onShowScoreboard,
}: GameScreenProps) {
  const game = useGameState(puzzle, { restore, isDaily });
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Tamamlama tek seferlik tetiklensin (puzzle yeniden olusursa sifirlanir).
  const completedRef = useRef(false);
  const [savedRecord, setSavedRecord] = useState(false);

  // Tamamlama: konfeti + skor kayit + haptik + (gunlukse) seri guncelle.
  useEffect(() => {
    if (game.isSolved && !completedRef.current) {
      completedRef.current = true;
      const isRecord = scoreIsNewRecord(
        puzzle.difficulty,
        puzzle.config.size,
        game.elapsedSeconds
      );
      setSavedRecord(isRecord);
      saveScore({
        difficulty: puzzle.difficulty,
        size: puzzle.config.size,
        seconds: game.elapsedSeconds,
        dateISO: new Date().toISOString(),
        hintsUsed: game.hintsUsed,
      });
      // Gunluk bulmacaysa serisi guncellenir (idempotent: ayni gunde 2. kez
      // cozme streak'i degistirmez — applyDailyCompletion ilgileniyor).
      if (isDaily) {
        const prev = loadDailyState();
        const nextState = applyDailyCompletion(prev);
        saveDailyState(nextState);
      }
      vibrateSuccess();
    }
    if (!game.isSolved) {
      completedRef.current = false;
    }
    // Sadece isSolved degisimine bagli kal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isSolved]);

  // Hata girisinde kisa titresim (showErrors acikken sadece).
  const lastBoardRef = useRef(game.board);
  useEffect(() => {
    if (!game.showErrors) {
      lastBoardRef.current = game.board;
      return;
    }
    // Son hamlede yanlis bir deger giridi mi? Sadece secili indekste degisikligi kontrol et.
    const idx = game.selectedIndex;
    const cur = game.board;
    const prev = lastBoardRef.current;
    if (
      idx >= 0 &&
      prev[idx] !== cur[idx] &&
      cur[idx] !== 0 &&
      cur[idx] !== puzzle.solution[idx]
    ) {
      vibrateShort();
    }
    lastBoardRef.current = cur;
  }, [game.board, game.selectedIndex, game.showErrors, puzzle.solution]);

  // Son ipucunu 5 saniye sonra otomatik kapat.
  useEffect(() => {
    if (!game.lastHint) return;
    const id = window.setTimeout(() => game.clearLastHint(), 5000);
    return () => window.clearTimeout(id);
  }, [game, game.lastHint]);

  const disabled = game.selectedIndex < 0 || game.isPaused || game.isSolved;
  const toolsDisabled = game.isPaused || game.isSolved;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-4 px-4 py-4">
      {/* Header: menu + sure + ayarlar */}
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
          aria-label="Menüye dön"
        >
          Menü
        </button>

        <div className="flex flex-col items-center">
          <p className="text-xs tracking-widest text-ink-soft">
            {isDaily ? "🗓️ GÜNLÜK · " : ""}
            {displayNameTR(puzzle.difficulty)} · {puzzle.config.size}×
            {puzzle.config.size}
          </p>
          <button
            type="button"
            onClick={game.togglePause}
            className="tnum text-2xl font-semibold text-ink leading-none mt-0.5"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
            aria-label={game.isPaused ? "Devam et" : "Duraklat"}
          >
            {formatTime(game.elapsedSeconds)}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg border border-grid-thin bg-surface px-3 py-1.5 text-sm text-ink-soft active:bg-accent-soft"
          aria-label="Ayarlar"
        >
          Ayarlar
        </button>
      </header>

      {/* Tahta */}
      <div className="relative">
        <BoardView
          config={puzzle.config}
          board={game.board}
          givens={puzzle.givens}
          solution={puzzle.solution}
          showErrors={game.showErrors}
          notesMap={game.notesMap}
          selectedIndex={game.selectedIndex}
          onSelect={game.select}
        />
        {game.isPaused && !game.isSolved && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg/85 backdrop-blur-sm">
            <button
              type="button"
              onClick={game.togglePause}
              className="text-2xl text-ink-soft"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Duraklatıldı — devam etmek için dokun
            </button>
          </div>
        )}
      </div>

      {/* Ipucu serit — son ipucunun aciklamasi */}
      {game.lastHint && (
        <div className="rounded-xl bg-accent-soft border border-accent/30 px-3 py-2 text-sm text-ink animate-[fadeIn_180ms_ease-out]">
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <span className="font-semibold text-accent">İpucu: </span>
          {game.lastHint.explanationTR}
        </div>
      )}

      {/* Arac cubugu */}
      <Toolbar
        onUndo={game.undo}
        canUndo={game.canUndo}
        onErase={game.erase}
        onToggleNoteMode={game.toggleNoteMode}
        noteMode={game.noteMode}
        onHint={game.takeHint}
        disabled={toolsDisabled}
      />

      {/* Rakam paleti */}
      <div className="mt-auto pb-2">
        <NumberPad
          size={puzzle.config.size}
          onInput={game.inputValue}
          disabled={disabled}
          noteMode={game.noteMode}
        />
      </div>

      {/* Tamamlama */}
      {game.isSolved && (
        <CompletionOverlay
          elapsedSeconds={game.elapsedSeconds}
          hintsUsed={game.hintsUsed}
          isNewRecord={savedRecord}
          onPlayAgain={onPlayAgain}
          onMenu={onExit}
          onShowScoreboard={onShowScoreboard}
        />
      )}

      {/* Ayarlar */}
      <SettingsSheet
        open={settingsOpen}
        showErrors={game.showErrors}
        onToggleShowErrors={() => game.setShowErrors(!game.showErrors)}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
