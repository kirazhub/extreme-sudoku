import type { GameConfig, Grid, Hint } from "./types";
import { candidates } from "./validator";
import { units, rowOf, colOf } from "./geometry";

// Mantiksal cozucu: kullaniciya ipucu vermek icin temel teknikleri uygular.
// Onceligi var olan en kolay teknige verir: once nakedSingle, sonra hiddenSingle.

/**
 * nakedSingle: bir hucrede tek bir aday kaldigi durum.
 * Acikca yazilabilir, baska secenek yok.
 */
function findNakedSingle(grid: Grid, config: GameConfig): Hint | null {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== 0) continue;
    const cs = candidates(grid, i, config);
    if (cs.size === 1) {
      const value = cs.values().next().value as number;
      const r = rowOf(i, config.size);
      const c = colOf(i, config.size);
      return {
        technique: "nakedSingle",
        index: i,
        value,
        explanationTR: `(${r + 1}, ${c + 1}) hucresinde tek olasi deger ${value}: digerlerini ayni satir, sutun veya kutu zaten engelliyor.`,
      };
    }
  }
  return null;
}

/**
 * hiddenSingle: bir birimde (satir/sutun/kutu) bir degerin sadece tek bir hucreye
 * yerlesebildigi durum. O hucrede baska adaylar olsa da.
 */
function findHiddenSingle(grid: Grid, config: GameConfig): Hint | null {
  const allUnits = units(config);
  // Birimleri sirayla gezerken hangi unit tipinde oldugunu bilmek aciklama icin lazim.
  const { size } = config;
  // units() siralamasi: once size adet satir, sonra size adet sutun, sonra kutular.
  for (let u = 0; u < allUnits.length; u++) {
    const unit = allUnits[u];
    const unitType =
      u < size ? "satir" : u < size * 2 ? "sutun" : "kutu";

    // Her olasi deger icin: bu birimde o degeri kabul edebilen hucreleri say.
    for (let v = 1; v <= size; v++) {
      // Once: bu deger birimde zaten varsa, atla.
      let already = false;
      for (const idx of unit) {
        if (grid[idx] === v) {
          already = true;
          break;
        }
      }
      if (already) continue;

      // Aday hucreleri bul.
      let candidateIdx = -1;
      let count = 0;
      for (const idx of unit) {
        if (grid[idx] !== 0) continue;
        const cs = candidates(grid, idx, config);
        if (cs.has(v)) {
          candidateIdx = idx;
          count++;
          if (count > 1) break;
        }
      }
      if (count === 1 && candidateIdx !== -1) {
        const r = rowOf(candidateIdx, size);
        const c = colOf(candidateIdx, size);
        return {
          technique: "hiddenSingle",
          index: candidateIdx,
          value: v,
          explanationTR: `${v} degeri bu ${unitType} icinde sadece (${r + 1}, ${c + 1}) hucresine sigabilir; o yuzden buraya ${v} yazilir.`,
        };
      }
    }
  }
  return null;
}

/**
 * Bir sonraki kullanilabilir ipucunu doner.
 * Once nakedSingle, sonra hiddenSingle. Hicbiri yoksa null.
 */
export function nextHint(grid: Grid, config: GameConfig): Hint | null {
  const naked = findNakedSingle(grid, config);
  if (naked) return naked;
  const hidden = findHiddenSingle(grid, config);
  if (hidden) return hidden;
  return null;
}
