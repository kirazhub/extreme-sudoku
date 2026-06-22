"use client";

// Oyun durum yonetimi — saf React state + 1sn'lik sayac.
// Mimari: ileride ipucu/not/hata vurgusu eklenebilir; arayuz minimal tutuldu.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isSolved as engineIsSolved,
  type Puzzle,
} from "@/lib/engine";

/** Saf yardimci: verilen indeks "given" mi? (givens'ta sifirdan farkliysa kilitli) */
export function isGiven(puzzle: Puzzle, index: number): boolean {
  return puzzle.givens[index] !== 0;
}

/** Saf yardimci: tahta tamamen dolmus mu? (sifir yok) */
export function isBoardFull(board: number[]): boolean {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0) return false;
  }
  return true;
}

/**
 * Saf yardimci: hucreye deger yerlestir.
 * - given hucre degismez.
 * - ayni deger varsa siler (toggle).
 * - 0 verirsen siler.
 * Yeni dizi doner (immutable).
 */
export function placeValue(
  board: number[],
  puzzle: Puzzle,
  index: number,
  value: number
): number[] {
  if (index < 0 || index >= board.length) return board;
  if (isGiven(puzzle, index)) return board;
  const next = board.slice();
  if (value === 0 || next[index] === value) {
    next[index] = 0;
  } else {
    next[index] = value;
  }
  return next;
}

export interface UseGameState {
  /** Suanki bulmaca (givens + solution + config). */
  puzzle: Puzzle;
  /** Oyuncunun calistigi tahta (givens'in kopyasi + oyuncu girisleri). */
  board: number[];
  /** Secili hucre indeksi (yoksa -1). */
  selectedIndex: number;
  /** Oyun basladigindan beri gecen saniye. */
  elapsedSeconds: number;
  /** Sayac durdu mu? */
  isPaused: boolean;
  /** Bulmaca cozuldu mu? (engine.isSolved ile) */
  isSolved: boolean;

  /** Bir hucreyi sec; ayni hucreye tekrar dokunma seciyi kaldirir. */
  select: (index: number) => void;
  /** Secili hucreye deger yaz (verilen hucre degismez). */
  inputValue: (value: number) => void;
  /** Secili hucreyi sil. */
  erase: () => void;
  /** Sayaci duraklat / devam ettir. */
  togglePause: () => void;
}

/**
 * Oyun durumunu yoneten ana hook.
 * @param puzzle Onceden uretilmis bulmaca (newPuzzle ile).
 */
export function useGameState(puzzle: Puzzle): UseGameState {
  // Tahta = givens'in kopyasi. Bulmaca degisirse sifirla.
  const [board, setBoard] = useState<number[]>(() => puzzle.givens.slice());
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Bulmaca degisirse her seyi sifirla.
  const puzzleRef = useRef(puzzle);
  useEffect(() => {
    if (puzzleRef.current !== puzzle) {
      puzzleRef.current = puzzle;
      setBoard(puzzle.givens.slice());
      setSelectedIndex(-1);
      setElapsedSeconds(0);
      setIsPaused(false);
    }
  }, [puzzle]);

  // Cozuldu mu? Hesaplanmis deger (memo).
  const solved = useMemo(
    () => engineIsSolved(board, puzzle.solution),
    [board, puzzle.solution]
  );

  // Sayac: 1sn'de bir, paused/solved durumunda durur.
  useEffect(() => {
    if (isPaused || solved) return;
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isPaused, solved]);

  const select = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? -1 : index));
  }, []);

  const inputValue = useCallback(
    (value: number) => {
      setBoard((prev) => {
        if (selectedIndex < 0) return prev;
        return placeValue(prev, puzzleRef.current, selectedIndex, value);
      });
    },
    [selectedIndex]
  );

  const erase = useCallback(() => {
    setBoard((prev) => {
      if (selectedIndex < 0) return prev;
      return placeValue(prev, puzzleRef.current, selectedIndex, 0);
    });
  }, [selectedIndex]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  return {
    puzzle,
    board,
    selectedIndex,
    elapsedSeconds,
    isPaused,
    isSolved: solved,
    select,
    inputValue,
    erase,
    togglePause,
  };
}

/** Saniye -> "mm:ss" gosterim. */
export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
