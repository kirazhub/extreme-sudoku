"use client";

// Oyun durum yonetimi — saf React state + 1sn'lik sayac.
// Mimari katmanlari:
//  - Saf yardimcilar (placeValue, isGiven, isBoardFull, formatTime): React'siz, test edilir.
//  - useGameState hook: tahta + notlar + undo + secim + sayac + ipucu + hata.
// UI tarafi notesMap'i { [index]: number[] } olarak alir; CellView orada gosterir.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  hint as engineHint,
  isSolved as engineIsSolved,
  type Hint,
  type Puzzle,
} from "@/lib/engine";
import {
  clearSavedGame,
  saveGame,
  type SavedGame,
} from "@/lib/game/savedGame";

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

/** Bir hucrenin not durumunu toggle eder. Saf — yeni nesne doner. */
export function toggleNote(
  notes: Record<number, number[]>,
  index: number,
  value: number
): Record<number, number[]> {
  const cur = notes[index] ?? [];
  const has = cur.includes(value);
  const nextArr = has ? cur.filter((v) => v !== value) : [...cur, value].sort((a, b) => a - b);
  const next = { ...notes };
  if (nextArr.length === 0) {
    delete next[index];
  } else {
    next[index] = nextArr;
  }
  return next;
}

/** Bir hucredeki tum notlari temizler. */
export function clearNotesAt(
  notes: Record<number, number[]>,
  index: number
): Record<number, number[]> {
  if (!notes[index]) return notes;
  const next = { ...notes };
  delete next[index];
  return next;
}

/** Tek geri-alinabilir hamle. */
type Move =
  | { kind: "value"; index: number; prev: number; next: number; prevNotes?: number[] }
  | { kind: "notes"; index: number; prev: number[]; next: number[] };

export interface UseGameState {
  /** Suanki bulmaca (givens + solution + config). */
  puzzle: Puzzle;
  /** Oyuncunun calistigi tahta. */
  board: number[];
  /** Hucre indeksi -> aday rakamlar dizisi. */
  notesMap: Record<number, number[]>;
  /** Secili hucre indeksi (yoksa -1). */
  selectedIndex: number;
  /** Oyun basladigindan beri gecen saniye. */
  elapsedSeconds: number;
  /** Sayac durdu mu? */
  isPaused: boolean;
  /** Bulmaca cozuldu mu? */
  isSolved: boolean;
  /** Not modu aktif mi? */
  noteMode: boolean;
  /** Hata gosterme acik mi? */
  showErrors: boolean;
  /** Kullanilan ipucu sayisi. */
  hintsUsed: number;
  /** Son ipucu (gostermek icin); null degilse banda yazilabilir. */
  lastHint: Hint | null;
  /** Undo edilebilir hamle var mi? */
  canUndo: boolean;

  select: (index: number) => void;
  inputValue: (value: number) => void;
  erase: () => void;
  togglePause: () => void;
  toggleNoteMode: () => void;
  setShowErrors: (v: boolean) => void;
  /** Mantiksal cozuc bir ipucu bulursa uygular ve banda yazar. */
  takeHint: () => void;
  /** Banda gosterilen son ipucunu kapat. */
  clearLastHint: () => void;
  /** Son hamleyi geri al. */
  undo: () => void;
}

/** useGameState opsiyonlari. */
export interface UseGameStateOptions {
  /**
   * Kaydedilmis yarim oyundan geri yukleme.
   * Verildiyse board/notes/elapsedSeconds/hintsUsed/selectedIndex bu degerlerle baslar.
   * Puzzle'in givens/solution/config'i restore'a uymali (cagiran sorumlu).
   */
  restore?: SavedGame | null;
  /**
   * Gunluk bulmaca mi? saveGame icine yazilir ki "Devam Et"te dogru flag korunsun.
   */
  isDaily?: boolean;
}

/**
 * Oyun durumunu yoneten ana hook.
 * @param puzzle Onceden uretilmis bulmaca (newPuzzle ile).
 * @param options Opsiyonel: restore (kayittan baslat) + isDaily (kaydetmek icin bayrak).
 */
export function useGameState(
  puzzle: Puzzle,
  options?: UseGameStateOptions
): UseGameState {
  const restore = options?.restore ?? null;
  const isDaily = options?.isDaily ?? false;

  // Tahta = givens'in kopyasi, ya da restore varsa kaydedilmis tahta.
  // Lazy initializer ile mount aninda bir kez calisir (SSR guvenli).
  const [board, setBoard] = useState<number[]>(() =>
    restore ? restore.board.slice() : puzzle.givens.slice()
  );
  const [notesMap, setNotesMap] = useState<Record<number, number[]>>(() => {
    if (!restore) return {};
    // Notlari kopyala (immutable referans).
    const copy: Record<number, number[]> = {};
    for (const [k, v] of Object.entries(restore.notes)) {
      copy[Number(k)] = v.slice();
    }
    return copy;
  });
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (!restore) return -1;
    return restore.selectedIndex ?? -1;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() =>
    restore ? restore.elapsedSeconds : 0
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [noteMode, setNoteMode] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(true);
  const [hintsUsed, setHintsUsed] = useState<number>(() =>
    restore ? restore.hintsUsed : 0
  );
  const [lastHint, setLastHint] = useState<Hint | null>(null);
  // Undo stack — ref + state degil cunku boyut UI'da gosterilmiyor, sadece canUndo.
  const undoStack = useRef<Move[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  // Bulmaca degisirse her seyi sifirla.
  const puzzleRef = useRef(puzzle);
  useEffect(() => {
    if (puzzleRef.current !== puzzle) {
      puzzleRef.current = puzzle;
      setBoard(puzzle.givens.slice());
      setNotesMap({});
      setSelectedIndex(-1);
      setElapsedSeconds(0);
      setIsPaused(false);
      setNoteMode(false);
      setHintsUsed(0);
      setLastHint(null);
      undoStack.current = [];
      setCanUndo(false);
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

  // ---------- Otomatik kaydetme ----------
  // Strateji: board/notesMap degisiminde (insan eylemi sonrasi) durumu yaz.
  // Ek olarak sayfa gizlenince/kapanirken o anki elapsedSeconds ile bir kez daha yaz —
  // yoksa kullanici sekmeyi kapatirsa son N saniye kaybolur.
  //
  // Cozulunce: kayit silinir (yarim oyun kalmasin) — bunu ayri bir effect yapiyor.

  // En guncel degerleri ref'lerde tut ki event listener'lar her zaman tazesini gorsun.
  const stateRef = useRef({
    board,
    notesMap,
    elapsedSeconds,
    hintsUsed,
    selectedIndex,
    solved,
    isDaily,
  });
  useEffect(() => {
    stateRef.current = {
      board,
      notesMap,
      elapsedSeconds,
      hintsUsed,
      selectedIndex,
      solved,
      isDaily,
    };
  }, [board, notesMap, elapsedSeconds, hintsUsed, selectedIndex, solved, isDaily]);

  // Anlik durumu kaydet — saf yardimci (effect'ler ve listener'lar buradan cagirir).
  const persistNow = useCallback(() => {
    const p = puzzleRef.current;
    const st = stateRef.current;
    // Cozulduyse hic yazma (clearSavedGame ayri effect'te yapar).
    if (st.solved) return;
    const payload: SavedGame = {
      size: p.config.size,
      difficulty: p.difficulty,
      isDaily: st.isDaily,
      givens: p.givens.slice(),
      solution: p.solution.slice(),
      board: st.board.slice(),
      notes: (() => {
        const copy: Record<number, number[]> = {};
        for (const [k, v] of Object.entries(st.notesMap)) {
          copy[Number(k)] = v.slice();
        }
        return copy;
      })(),
      elapsedSeconds: st.elapsedSeconds,
      hintsUsed: st.hintsUsed,
      selectedIndex: st.selectedIndex >= 0 ? st.selectedIndex : null,
      savedAt: Date.now(),
    };
    saveGame(payload);
  }, []);

  // board/notes/hintsUsed/selectedIndex degisince yaz (her saniye degil; "etkinlik" anlarinda).
  useEffect(() => {
    // Cozulduyse skip — clear ayri effect'te.
    if (solved) return;
    persistNow();
  }, [board, notesMap, hintsUsed, selectedIndex, persistNow, solved]);

  // Sayfa gizlenince / kapatilirken son durumu (ozellikle elapsedSeconds) yaz.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHide = () => {
      // visibilitychange'te document.hidden true geldiyse yaz.
      if (document.visibilityState === "hidden") {
        persistNow();
      }
    };
    const onPageHide = () => persistNow();
    const onBeforeUnload = () => persistNow();

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [persistNow]);

  // Cozulunce kaydi sil — yarim oyun kalmasin.
  useEffect(() => {
    if (solved) {
      clearSavedGame();
    }
  }, [solved]);

  // ---------- Otomatik kaydetme sonu ----------

  // Undo stack'a hamle ekle.
  const pushMove = useCallback((m: Move) => {
    undoStack.current.push(m);
    // Asiri buyumemesi icin son 200 hamleyi tut.
    if (undoStack.current.length > 200) {
      undoStack.current.splice(0, undoStack.current.length - 200);
    }
    setCanUndo(true);
  }, []);

  const select = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? -1 : index));
  }, []);

  const inputValue = useCallback(
    (value: number) => {
      const idx = selectedIndex;
      if (idx < 0) return;
      const p = puzzleRef.current;
      if (isGiven(p, idx)) return;

      if (noteMode && value !== 0) {
        // Not modu: tahtada deger varsa once silmeden notu yazma — hala ekleyelim.
        // Tek hucredeki notu toggle et.
        setNotesMap((prev) => {
          const cur = prev[idx] ?? [];
          const nextMap = toggleNote(prev, idx, value);
          pushMove({
            kind: "notes",
            index: idx,
            prev: cur,
            next: nextMap[idx] ?? [],
          });
          return nextMap;
        });
        return;
      }

      // Normal mod: degeri yerlestir.
      setBoard((prev) => {
        const prevVal = prev[idx];
        const next = placeValue(prev, p, idx, value);
        if (next === prev || next[idx] === prevVal) return prev;
        // Notlari da temizle (bu hucre artik degerli).
        let prevNotes: number[] | undefined;
        setNotesMap((nm) => {
          if (nm[idx]) {
            prevNotes = nm[idx];
            return clearNotesAt(nm, idx);
          }
          return nm;
        });
        pushMove({ kind: "value", index: idx, prev: prevVal, next: next[idx], prevNotes });
        return next;
      });
    },
    [selectedIndex, noteMode, pushMove]
  );

  const erase = useCallback(() => {
    const idx = selectedIndex;
    if (idx < 0) return;
    const p = puzzleRef.current;
    if (isGiven(p, idx)) return;
    // Hem deger hem not silinebilir; once degeri sil; deger yoksa notlari sil.
    setBoard((prev) => {
      const prevVal = prev[idx];
      if (prevVal !== 0) {
        const next = prev.slice();
        next[idx] = 0;
        pushMove({ kind: "value", index: idx, prev: prevVal, next: 0 });
        return next;
      }
      return prev;
    });
    setNotesMap((nm) => {
      const cur = nm[idx];
      if (cur && cur.length > 0) {
        // deger zaten 0 idi -> bu da bir not silme hamlesi.
        // (Eger yukaridaki value setter zaten push ettiyse cifte push olmaz cunku farkli koldayiz.)
        pushMove({ kind: "notes", index: idx, prev: cur, next: [] });
        return clearNotesAt(nm, idx);
      }
      return nm;
    });
  }, [selectedIndex, pushMove]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const toggleNoteMode = useCallback(() => {
    setNoteMode((m) => !m);
  }, []);

  const takeHint = useCallback(() => {
    const p = puzzleRef.current;
    const h = engineHint(board, p.config);
    if (!h) {
      setLastHint(null);
      return;
    }
    // Hucreyi sec, ipucunu banda yaz, degeri uygula (notlari temizle).
    setSelectedIndex(h.index);
    setLastHint(h);
    setHintsUsed((n) => n + 1);
    setBoard((prev) => {
      if (prev[h.index] === h.value) return prev;
      const next = prev.slice();
      const prevVal = prev[h.index];
      next[h.index] = h.value;
      pushMove({ kind: "value", index: h.index, prev: prevVal, next: h.value });
      return next;
    });
    setNotesMap((nm) => (nm[h.index] ? clearNotesAt(nm, h.index) : nm));
  }, [board, pushMove]);

  const clearLastHint = useCallback(() => setLastHint(null), []);

  const undo = useCallback(() => {
    const m = undoStack.current.pop();
    if (!m) {
      setCanUndo(false);
      return;
    }
    if (m.kind === "value") {
      setBoard((prev) => {
        const next = prev.slice();
        next[m.index] = m.prev;
        return next;
      });
      if (m.prevNotes && m.prevNotes.length > 0) {
        setNotesMap((nm) => ({ ...nm, [m.index]: m.prevNotes! }));
      }
    } else {
      setNotesMap((nm) => {
        const next = { ...nm };
        if (m.prev.length === 0) {
          delete next[m.index];
        } else {
          next[m.index] = m.prev;
        }
        return next;
      });
    }
    setCanUndo(undoStack.current.length > 0);
  }, []);

  return {
    puzzle,
    board,
    notesMap,
    selectedIndex,
    elapsedSeconds,
    isPaused,
    isSolved: solved,
    noteMode,
    showErrors,
    hintsUsed,
    lastHint,
    canUndo,
    select,
    inputValue,
    erase,
    togglePause,
    toggleNoteMode,
    setShowErrors,
    takeHint,
    clearLastHint,
    undo,
  };
}

/** Saniye -> "mm:ss" gosterim. */
export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
