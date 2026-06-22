"use client";

// Oyun araç çubuğu: Geri Al, Sil, Not, İpucu butonları.
// Mobil-öncelikli, büyük dokunma alanları (≥44px).

export interface ToolbarProps {
  onUndo: () => void;
  canUndo: boolean;
  onErase: () => void;
  onToggleNoteMode: () => void;
  noteMode: boolean;
  onHint: () => void;
  disabled?: boolean;
}

export function Toolbar({
  onUndo,
  canUndo,
  onErase,
  onToggleNoteMode,
  noteMode,
  onHint,
  disabled,
}: ToolbarProps) {
  const baseBtn =
    "flex flex-col items-center justify-center gap-0.5 rounded-xl border border-grid-thin bg-surface px-2 py-2 text-xs text-ink-soft font-medium transition-colors active:bg-accent-soft disabled:opacity-40 disabled:active:bg-surface h-14";

  return (
    <div className="grid grid-cols-4 gap-2">
      <button
        type="button"
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className={baseBtn}
        aria-label="Geri Al"
      >
        <UndoIcon />
        <span>Geri Al</span>
      </button>
      <button
        type="button"
        onClick={onErase}
        disabled={disabled}
        className={baseBtn}
        aria-label="Sil"
      >
        <EraseIcon />
        <span>Sil</span>
      </button>
      <button
        type="button"
        onClick={onToggleNoteMode}
        disabled={disabled}
        className={`${baseBtn} ${noteMode ? "border-accent bg-accent-soft text-accent" : ""}`}
        aria-label="Not modu"
        aria-pressed={noteMode}
      >
        <NoteIcon />
        <span>{noteMode ? "Not • Açık" : "Not"}</span>
      </button>
      <button
        type="button"
        onClick={onHint}
        disabled={disabled}
        className={baseBtn}
        aria-label="İpucu"
      >
        <HintIcon />
        <span>İpucu</span>
      </button>
    </div>
  );
}

// SVG ikonlar — küçük, dış kütüphane gerekmiyor.
function UndoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-7l-3 3" />
    </svg>
  );
}
function EraseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13.5 8.5 4 3 9.5 12.5 19H21" />
      <path d="m13 19 5-5" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}
function HintIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.4.4.8.8 1 1.3v2h6v-2c.2-.5.6-.9 1-1.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}
