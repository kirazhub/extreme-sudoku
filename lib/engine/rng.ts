// Deterministik seeded RNG: mulberry32 algoritmasi.
// Ayni seed -> ayni dizi. Bulmaca uretiminin tekrarlanabilirligi icin kritik.

/**
 * Verilen tohumdan deterministik bir [0,1) sayi uretici dondurur.
 * Cagri yapildikca yeni sayi uretir.
 */
export function makeRng(seed: number): () => number {
  // mulberry32: kompakt ve yeterince iyi PRNG.
  // Seed'i 32-bit isaretsiz tamsayiya zorla.
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bir diziyi Fisher-Yates ile karistirilmis YENI bir dizi olarak dondurur.
 * Orijinal dizi degistirilmez.
 */
export function shuffle<T>(array: readonly T[], rng: () => number): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}
