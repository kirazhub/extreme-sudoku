"use client";

// Küçük ayar sayfası (modal). Şimdilik sadece "Hata göster" var.
// Karta dokununca arka plan kapatır. Yumusak fade ile acilir.

export interface SettingsSheetProps {
  open: boolean;
  showErrors: boolean;
  onToggleShowErrors: () => void;
  onClose: () => void;
}

export function SettingsSheet({
  open,
  showErrors,
  onToggleShowErrors,
  onClose,
}: SettingsSheetProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-bg/70 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div
        className="w-full max-w-md rounded-t-3xl bg-surface p-5 shadow-2xl border-t border-grid-thin animate-[slideUp_220ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        <div className="mx-auto h-1.5 w-10 rounded-full bg-grid-thin" />
        <h2
          className="mt-4 text-xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Ayarlar
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          <label className="flex items-center justify-between rounded-xl bg-bg p-3 active:bg-accent-soft cursor-pointer">
            <div className="flex flex-col">
              <span className="text-base font-medium text-ink">
                Hataları göster
              </span>
              <span className="text-xs text-ink-soft">
                Yanlış girilen değerler kırmızı görünür.
              </span>
            </div>
            <Toggle on={showErrors} onChange={onToggleShowErrors} />
          </label>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-2xl bg-accent text-white font-semibold shadow-md active:scale-[0.98]"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        on ? "bg-accent" : "bg-grid-thin"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
