import type { Difficulty, GameConfig } from "./types";

// Zorluk seviyesi ile boyut basina kac ipucu (clue) birakilacagini hesaplar.
// Asagidaki sayilar deneyimsel: extreme/impossible cok az ipucu birakir.

/** UI'da gosterilecek Turkce zorluk adi. */
export function displayNameTR(d: Difficulty): string {
  switch (d) {
    case "easy":
      return "Kolay";
    case "medium":
      return "Orta";
    case "hard":
      return "Zor";
    case "extreme":
      return "Extreme";
    case "impossible":
      return "İmkânsız";
  }
}

// Her zorluk icin "kalmasi hedeflenen ipucu yuzdesi" (tahta hucre sayisina gore).
// Daha yuksek yuzde = daha kolay (daha cok ipucu birakilir).
const CLUE_RATIO: Record<Difficulty, number> = {
  easy: 0.55,
  medium: 0.45,
  hard: 0.38,
  extreme: 0.32,
  impossible: 0.28,
};

// 16x16 icin minimum guvenli yuzde (cok agresif boslatma cok yavas olur).
const CLUE_RATIO_16: Record<Difficulty, number> = {
  easy: 0.65,
  medium: 0.60,
  hard: 0.55,
  extreme: 0.50,
  impossible: 0.45,
};

/**
 * Verilen zorluk + geometri icin hedef ipucu sayisini doner.
 * 16x16 icin daha cok ipucu birakilir (uretim performansi icin).
 */
export function targetClues(d: Difficulty, config: GameConfig): number {
  const total = config.size * config.size;
  const ratio =
    config.size === 16 ? CLUE_RATIO_16[d] : CLUE_RATIO[d];
  return Math.max(
    minClues(config),
    Math.round(total * ratio)
  );
}

/**
 * Bir tahta icin teorik minimum ipucu sayisini doner.
 * Bu sert bir alt sinir degil — uretim hedefi icin guvenli alt sinir.
 */
function minClues(config: GameConfig): number {
  // 9x9 icin matematiksel minimum 17'dir. Diger boyutlar icin makul tahmin.
  switch (config.size) {
    case 4:
      return 4;
    case 6:
      return 8;
    case 9:
      return 17;
    case 16:
      return 55;
    default:
      return Math.floor((config.size * config.size) / 4);
  }
}
