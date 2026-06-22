"use client";

// Tek sayfa app — faz: 'setup' | 'playing' | 'scoreboard'. Faz secimi React state ile.

import { useState, useCallback } from "react";
import {
  dailySeed,
  newPuzzle,
  type Puzzle,
  type Difficulty,
} from "@/lib/engine";
import { SetupScreen, type SetupChoice } from "@/components/SetupScreen";
import { GameScreen } from "@/components/GameScreen";
import { ScoreboardScreen } from "@/components/ScoreboardScreen";

type Phase =
  | { kind: "setup" }
  | {
      kind: "playing";
      puzzle: Puzzle;
      choice: SetupChoice;
      isDaily: boolean;
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

export default function Home() {
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });

  const handleStart = useCallback((choice: SetupChoice) => {
    setPhase({
      kind: "playing",
      puzzle: buildPuzzle(choice),
      choice,
      isDaily: !!choice.isDaily,
    });
  }, []);

  const handleExit = useCallback(() => {
    setPhase({ kind: "setup" });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPhase((p) => {
      if (p.kind !== "playing") return p;
      // Gunluk bulmacayi "tekrar oyna" derken normal moda geciyoruz —
      // aksi halde ayni bulmacayi tekrar acmis oluruz; daha anlamlisi
      // ayni zorluk/boyutta taze bir bulmaca uretmek.
      const nextChoice: SetupChoice = { ...p.choice, isDaily: false };
      return {
        kind: "playing",
        puzzle: buildPuzzle(nextChoice),
        choice: nextChoice,
        isDaily: false,
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
  }, []);

  if (phase.kind === "setup") {
    return (
      <SetupScreen
        onStart={handleStart}
        onShowScoreboard={handleShowScoreboard}
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
      onExit={handleExit}
      onPlayAgain={handlePlayAgain}
      onShowScoreboard={handleShowScoreboard}
    />
  );
}
