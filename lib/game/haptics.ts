// Mobil haptik geribildirim — navigator.vibrate guvenli sarmalayicisi.
// SSR'de ve desteklemeyen tarayicilarda no-op.

function canVibrate(): boolean {
  try {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    );
  } catch {
    return false;
  }
}

/** Kisa titresim — hata/uyari icin (ornek: 30ms). */
export function vibrateShort(): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(30);
  } catch {
    // sessiz gec
  }
}

/** Uzun titresim — basari/tamamlama icin (desen). */
export function vibrateSuccess(): void {
  if (!canVibrate()) return;
  try {
    // Coskulu desen: 80ms titresim, 40 sus, 120 titresim.
    navigator.vibrate([80, 40, 120]);
  } catch {
    // sessiz gec
  }
}
