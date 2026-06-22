"use client";

// Tek sayfa app — faz: 'setup' | 'playing'. Faz secimi React state ile.

import { useState } from "react";
import { newPuzzle, type Puzzle } from "@/lib/engine";
import { SetupScreen, type SetupChoice } from "@/components/SetupScreen";
import { GameScreen } from "@/components/GameScreen";

type Phase =
  | { kind: "setup" }
  | { kind: "playing"; puzzle: Puzzle };

export default function Home() {
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });

  function handleStart(choice: SetupChoice) {
    // Her oturumda farkli tohum: tarihten + rastgele bilesen.
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const puzzle = newPuzzle({
      size: choice.size,
      difficulty: choice.difficulty,
      seed,
      extraClues: choice.extraClues,
    });
    setPhase({ kind: "playing", puzzle });
  }

  function handleExit() {
    setPhase({ kind: "setup" });
  }

  if (phase.kind === "setup") {
    return <SetupScreen onStart={handleStart} />;
  }
  return <GameScreen puzzle={phase.puzzle} onExit={handleExit} />;
}
