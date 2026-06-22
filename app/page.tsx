"use client";

// Tek sayfa app — faz: 'setup' | 'playing' | 'scoreboard'. Faz secimi React state ile.
// "Devam Et" akisi: localStorage'ta kayitli yarim oyun varsa SetupScreen onu
// kart olarak gosterir; tiklayinca handleResume Puzzle'i yeniden kurar ve
// playing fazina restore prop'u ile gecer.

import { useState, useCallback } from "react";
import {
  configForSize,
  dailySeed,
  newPuzzle,
  type Puzzle,
  type Difficulty,
} from "@/lib/engine";
import { SetupScreen, type SetupChoice } from "@/components/SetupScreen";
import { GameScreen } from "@/components/GameScreen";
import { ScoreboardScreen } from "@/components/ScoreboardScreen";
import {
  clearSavedGame,
  loadSavedGame,
  type SavedGame,
} from "@/lib/game/savedGame";

type Phase =
  | { kind: "setup" }
  | {
      kind: "playing";
      puzzle: Puzzle;
      choice: SetupChoice;
      isDaily: boolean;
      /** Devam Et akisinda useGameState'e iletilen kayit. */
      restore?: SavedGame | null;
    }
  | { kind: "scoreboard"; from: "setup" | "playing"; lastChoice?: SetupChoice };

// Yardimci: secimden yeni puzzle uretir.
// Gunluk bulmaca icin dailySeed() (tarihe bagli sabit tohum) kullanilir;
// herkeste o gun ayni bulmaca uretilsin diye.
function buildPuzzle(choice: SetupChoice): Puzzle {
  const seed = choice.isDaily
    ? dailySeed()
    : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  return newPuzzle({
    size: choice.size,
    difficulty: choice.difficulty as Difficulty,
    seed,
    extraClues: choice.extraClues,
  });
}

// Yardimci: kayitli yarim oyundan Puzzle'i yeniden kur.
// newPuzzle calistirmiyoruz — givens/solution/config kaydedildigi icin
// olusturma maliyetinden kaciniyoruz ve tam ayni bulmaca geliyor.
function rebuildPuzzleFromSaved(saved: SavedGame): Puzzle {
  return {
    givens: saved.givens.slice(),
    solution: saved.solution.slice(),
    config: configForSize(saved.size),
    difficulty: saved.difficulty,
  };
}

export default function Home() {
  // Acilista lazy initial ile localStorage'tan yarim oyunu oku.
  // SSR'da loadSavedGame() null doner (window guard'i var) — istemcide gercek deger gelir.
  const [savedGame, setSavedGame] = useState<SavedGame | null>(() =>
    loadSavedGame()
  );

  const [phase, setPhase] = useState<Phase>({ kind: "setup" });

  const handleStart = useCallback((choice: SetupChoice) => {
    // Yeni oyun baslarken eski yarim oyun kaydini temizle —
    // useGameState zaten yeni oyun icin tazesini yazacak ama temiz baslamak iyi.
    clearSavedGame();
    setSavedGame(null);
    setPhase({
      kind: "playing",
      puzzle: buildPuzzle(choice),
      choice,
      isDaily: !!choice.isDaily,
      restore: null,
    });
  }, []);

  const handleResume = useCallback(() => {
    // Tiklama aninda taze veriyi oku (state stale olabilir).
    const saved = loadSavedGame();
    if (!saved) return;
    const puzzle = rebuildPuzzleFromSaved(saved);
    const choice: SetupChoice = {
      size: saved.size,
      difficulty: saved.difficulty,
      extraClues: 0,
      isDaily: saved.isDaily,
    };
    setPhase({
      kind: "playing",
      puzzle,
      choice,
      isDaily: saved.isDaily,
      restore: saved,
    });
  }, []);

  const handleExit = useCallback(() => {
    // Menuye donerken kaydi silmiyoruz — kullanici daha sonra Devam Et ile geri donsun.
    // Ancak state'i guncelleyelim ki Setup yeniden goruntulendiginde Devam Et kartini gostersin.
    setSavedGame(loadSavedGame());
    setPhase({ kind: "setup" });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPhase((p) => {
      if (p.kind !== "playing") return p;
      // Gunluk bulmacayi "tekrar oyna" derken normal moda geciyoruz —
      // aksi halde ayni bulmacayi tekrar acmis oluruz; daha anlamlisi
      // ayni zorluk/boyutta taze bir bulmaca uretmek.
      const nextChoice: SetupChoice = { ...p.choice, isDaily: false };
      // Tekrar oyna -> eski kayit yok (zaten cozulmustu, clear edilmis olmali)
      clearSavedGame();
      setSavedGame(null);
      return {
        kind: "playing",
        puzzle: buildPuzzle(nextChoice),
        choice: nextChoice,
        isDaily: false,
        restore: null,
      };
    });
  }, []);

  const handleShowScoreboard = useCallback(() => {
    setPhase((p) => {
      if (p.kind === "playing") {
        return { kind: "scoreboard", from: "playing", lastChoice: p.choice };
      }
      return { kind: "scoreboard", from: "setup" };
    });
  }, []);

  const handleScoreboardBack = useCallback(() => {
    setPhase((p) => {
      if (p.kind !== "scoreboard") return p;
      if (p.from === "playing" && p.lastChoice) {
        // Oyundan geldiyse menuye don (oyun durumu kaybolur).
        return { kind: "setup" };
      }
      return { kind: "setup" };
    });
    // Skorboard'dan menuye donerken kayit durumunu tazele.
    setSavedGame(loadSavedGame());
  }, []);

  if (phase.kind === "setup") {
    return (
      <SetupScreen
        onStart={handleStart}
        onShowScoreboard={handleShowScoreboard}
        onResume={savedGame ? handleResume : undefined}
        savedGame={savedGame}
      />
    );
  }
  if (phase.kind === "scoreboard") {
    return <ScoreboardScreen onBack={handleScoreboardBack} />;
  }
  return (
    <GameScreen
      puzzle={phase.puzzle}
      isDaily={phase.isDaily}
      restore={phase.restore}
      onExit={handleExit}
      onPlayAgain={handlePlayAgain}
      onShowScoreboard={handleShowScoreboard}
    />
  );
}
