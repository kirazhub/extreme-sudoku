import type { GameConfig, Grid, Hint } from "./types";
import { units, rowOf, colOf, peersOf } from "./geometry";

// Mantiksal cozucu: kullaniciya ipucu vermek icin temel + ileri teknikleri uygular.
// Strateji:
//  1) Aday matrisi kur (her bos hucre icin olasi degerler).
//  2) Once dogrudan yerlestirme tekniklerini dene: nakedSingle, hiddenSingle.
//  3) Sonra eleme tekniklerini dene (nakedPair/Triple, hiddenPair, pointingPair,
//     boxLineReduction, xWing). Eleme yaptiktan sonra ortaya cikan single'i
//     o tekniginin adi ile birlikte ipucu olarak dondur.
// Bu sayede nextHint her zaman somut bir (index, value) yerlestirmesi onerir,
// ama hangi ileri teknigin gerektigi konusunda dogru bilgi verir.

/** Insan-okur teknik adlari icin Turkce karsiliklar. */
export const TECHNIQUE_NAMES_TR: Record<string, string> = {
  nakedSingle: "Tek Aday",
  hiddenSingle: "Gizli Tek",
  nakedPair: "Ciplak Ikili",
  nakedTriple: "Ciplak Uclu",
  hiddenPair: "Gizli Ikili",
  pointingPair: "Isaret Eden Ikili",
  boxLineReduction: "Kutu-Satir Indirgeme",
  xWing: "X-Kanat",
};

/** Teknik zorluk seviyeleri (rateDifficulty icin). Buyuk = daha zor. */
export const TECHNIQUE_RANK: Record<string, number> = {
  nakedSingle: 1,
  hiddenSingle: 2,
  nakedPair: 3,
  hiddenPair: 3,
  pointingPair: 3,
  boxLineReduction: 3,
  nakedTriple: 4,
  xWing: 4,
};

/** Bir hucrenin aday kumesi. Set kullaniyoruz ama iterasyon her zaman sirali yapilir. */
type Candidates = Set<number>[];

/** Bir birim tipi (satir/sutun/kutu) - aciklama icin. */
type UnitType = "satir" | "sutun" | "kutu";

interface UnitInfo {
  type: UnitType;
  /** Birim indeksi (0..size-1 satir/sutun, ya da kutu numarasi) */
  index: number;
}

/** Bir birimin tipini ve numarasini units() sirasina gore hesaplar. */
function unitInfoAt(u: number, size: number): UnitInfo {
  if (u < size) return { type: "satir", index: u };
  if (u < size * 2) return { type: "sutun", index: u - size };
  return { type: "kutu", index: u - size * 2 };
}

/**
 * Tahtanin tum bos hucreleri icin aday kumelerini hesaplar.
 * Dolu hucreler icin bos set.
 */
function buildCandidates(grid: Grid, config: GameConfig): Candidates {
  const { size } = config;
  const cands: Candidates = new Array(grid.length);
  for (let i = 0; i < grid.length; i++) {
    cands[i] = new Set<number>();
    if (grid[i] !== 0) continue;
    // Peer'lerdeki degerleri topla.
    const peers = peersOf(i, config);
    const blocked = new Set<number>();
    for (const p of peers) {
      const v = grid[p];
      if (v !== 0) blocked.add(v);
    }
    for (let v = 1; v <= size; v++) {
      if (!blocked.has(v)) cands[i].add(v);
    }
  }
  return cands;
}

/** Bir Set'i siralayip dizi olarak doner (determinizm icin). */
function sortedArray(s: Set<number>): number[] {
  return Array.from(s).sort((a, b) => a - b);
}

/** Bir hucre listesi icindeki bos hucreleri (grid[i]===0) sirali olarak doner. */
function emptyCellsOfUnit(unit: number[], grid: Grid): number[] {
  const result: number[] = [];
  for (const idx of unit) {
    if (grid[idx] === 0) result.push(idx);
  }
  return result.sort((a, b) => a - b);
}

// ============================================================================
// Dogrudan yerlestirme teknikleri (single)
// ============================================================================

/** nakedSingle: bir hucrede tek bir aday kaldigi durum. */
function findNakedSingle(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): Hint | null {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== 0) continue;
    if (cands[i].size === 1) {
      const value = sortedArray(cands[i])[0];
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

/** hiddenSingle: bir birimde bir degerin sadece tek hucreye sigabildigi durum. */
function findHiddenSingle(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): Hint | null {
  const allUnits = units(config);
  const { size } = config;
  for (let u = 0; u < allUnits.length; u++) {
    const unit = allUnits[u];
    const info = unitInfoAt(u, size);

    for (let v = 1; v <= size; v++) {
      // Birimde zaten varsa atla.
      let already = false;
      for (const idx of unit) {
        if (grid[idx] === v) {
          already = true;
          break;
        }
      }
      if (already) continue;

      let candidateIdx = -1;
      let count = 0;
      for (const idx of unit) {
        if (grid[idx] !== 0) continue;
        if (cands[idx].has(v)) {
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
          explanationTR: `${v} degeri bu ${info.type} icinde sadece (${r + 1}, ${c + 1}) hucresine sigabilir; o yuzden buraya ${v} yazilir.`,
        };
      }
    }
  }
  return null;
}

// ============================================================================
// Eleme teknikleri (adaylari daraltirlar, dogrudan yerlestirme yapmaz)
// ============================================================================

interface Elimination {
  /** Hangi hucreden hangi aday eleniyor. */
  cell: number;
  value: number;
}

interface EliminationResult {
  technique: string;
  eliminations: Elimination[];
  /** Insan-okur Turkce aciklama gocdesi (ne yapildi). */
  reasonTR: string;
}

/**
 * nakedPair / nakedTriple: bir birimde n bos hucre, tam olarak ayni n adayi paylasiyorsa
 * o n aday birimdeki diger hucrelerden elenir.
 */
function findNakedSubset(
  grid: Grid,
  cands: Candidates,
  config: GameConfig,
  groupSize: 2 | 3
): EliminationResult | null {
  const allUnits = units(config);
  const { size } = config;

  for (let u = 0; u < allUnits.length; u++) {
    const unit = allUnits[u];
    const info = unitInfoAt(u, size);
    const empties = emptyCellsOfUnit(unit, grid);

    // n adayi tam olarak n hucrede paylasan kombinasyonlari bul.
    // Adayi <= groupSize olan hucrelere odaklaniyoruz.
    const candidates: number[] = empties.filter(
      (i) => cands[i].size >= 2 && cands[i].size <= groupSize
    );
    if (candidates.length < groupSize) continue;

    // Kombinasyonlar (deterministik: sirali girisi sirayla isle).
    const combos = kCombinations(candidates, groupSize);
    for (const combo of combos) {
      // Adaylar birlesimi
      const union = new Set<number>();
      for (const idx of combo) {
        for (const v of cands[idx]) union.add(v);
      }
      if (union.size !== groupSize) continue;

      // Birimdeki digerlerinden bu adaylari ele.
      const comboSet = new Set(combo);
      const eliminations: Elimination[] = [];
      for (const idx of empties) {
        if (comboSet.has(idx)) continue;
        for (const v of sortedArray(union)) {
          if (cands[idx].has(v)) {
            eliminations.push({ cell: idx, value: v });
          }
        }
      }
      if (eliminations.length > 0) {
        const vals = sortedArray(union).join(", ");
        const cellsStr = combo
          .map((i) => `(${rowOf(i, size) + 1}, ${colOf(i, size) + 1})`)
          .join(" ve ");
        const tech = groupSize === 2 ? "nakedPair" : "nakedTriple";
        const trName = TECHNIQUE_NAMES_TR[tech];
        return {
          technique: tech,
          eliminations,
          reasonTR: `${trName}: bu ${info.type} icinde ${cellsStr} hucreleri sadece {${vals}} degerlerini paylasiyor; o yuzden bu adaylar ayni ${info.type}'in diger hucrelerinden elenir.`,
        };
      }
    }
  }
  return null;
}

/**
 * hiddenPair: bir birimde 2 deger, tam olarak 2 hucrede goruluyorsa,
 * o iki hucrenin diger adaylari elenir.
 */
function findHiddenPair(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): EliminationResult | null {
  const allUnits = units(config);
  const { size } = config;

  for (let u = 0; u < allUnits.length; u++) {
    const unit = allUnits[u];
    const info = unitInfoAt(u, size);
    const empties = emptyCellsOfUnit(unit, grid);

    // Birimdeki her degeri kabul edebilen hucreleri toparla.
    const valueCells: Map<number, number[]> = new Map();
    for (let v = 1; v <= size; v++) {
      const cells: number[] = [];
      for (const idx of empties) {
        if (cands[idx].has(v)) cells.push(idx);
      }
      if (cells.length === 2) valueCells.set(v, cells);
    }

    // 2 hucreye sigan degerleri ciftler halinde dene.
    const vals = Array.from(valueCells.keys()).sort((a, b) => a - b);
    for (let i = 0; i < vals.length; i++) {
      for (let j = i + 1; j < vals.length; j++) {
        const v1 = vals[i];
        const v2 = vals[j];
        const c1 = valueCells.get(v1)!;
        const c2 = valueCells.get(v2)!;
        if (c1[0] !== c2[0] || c1[1] !== c2[1]) continue;
        // Ayni iki hucreye sigiyorlar.
        const eliminations: Elimination[] = [];
        for (const idx of c1) {
          for (const v of sortedArray(cands[idx])) {
            if (v !== v1 && v !== v2) {
              eliminations.push({ cell: idx, value: v });
            }
          }
        }
        if (eliminations.length > 0) {
          const cellsStr = c1
            .map((k) => `(${rowOf(k, size) + 1}, ${colOf(k, size) + 1})`)
            .join(" ve ");
          return {
            technique: "hiddenPair",
            eliminations,
            reasonTR: `Gizli Ikili: ${v1} ve ${v2} degerleri bu ${info.type} icinde yalnizca ${cellsStr} hucrelerine sigabiliyor; o yuzden bu hucrelerden diger adaylar elenir.`,
          };
        }
      }
    }
  }
  return null;
}

/**
 * pointingPair (kilitli aday - kutu icinde): Bir kutuda bir degerin tum adaylari
 * ayni satir ya da ayni sutunda yer aliyorsa; o satir/sutunun kutu disindaki
 * hucrelerinden o deger elenir.
 */
function findPointingPair(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): EliminationResult | null {
  const { size, boxRows, boxCols } = config;
  const boxesPerRow = size / boxCols;
  const boxesPerCol = size / boxRows;

  for (let br = 0; br < boxesPerCol; br++) {
    for (let bc = 0; bc < boxesPerRow; bc++) {
      // Kutudaki hucreler
      const boxCells: number[] = [];
      for (let r = br * boxRows; r < (br + 1) * boxRows; r++) {
        for (let c = bc * boxCols; c < (bc + 1) * boxCols; c++) {
          boxCells.push(r * size + c);
        }
      }
      const boxIdx = br * boxesPerRow + bc;

      for (let v = 1; v <= size; v++) {
        const cellsWithV: number[] = [];
        let alreadyPlaced = false;
        for (const idx of boxCells) {
          if (grid[idx] === v) {
            alreadyPlaced = true;
            break;
          }
          if (grid[idx] === 0 && cands[idx].has(v)) cellsWithV.push(idx);
        }
        if (alreadyPlaced) continue;
        if (cellsWithV.length < 2) continue;

        // Ayni satirda mi?
        const rows = new Set(cellsWithV.map((i) => rowOf(i, size)));
        const cols = new Set(cellsWithV.map((i) => colOf(i, size)));

        if (rows.size === 1) {
          const r = sortedArray(rows)[0];
          // Bu satirin kutu disindaki bos hucrelerinden v'yi ele.
          const eliminations: Elimination[] = [];
          for (let c = 0; c < size; c++) {
            const idx = r * size + c;
            if (boxCells.includes(idx)) continue;
            if (grid[idx] === 0 && cands[idx].has(v)) {
              eliminations.push({ cell: idx, value: v });
            }
          }
          if (eliminations.length > 0) {
            return {
              technique: "pointingPair",
              eliminations,
              reasonTR: `Isaret Eden Ikili: Kutu ${boxIdx + 1} icindeki ${v} adaylari sadece ${r + 1}. satira yerlesebiliyor; o yuzden bu satirin kutu disindaki hucrelerinden ${v} elenir.`,
            };
          }
        }
        if (cols.size === 1) {
          const c = sortedArray(cols)[0];
          const eliminations: Elimination[] = [];
          for (let r = 0; r < size; r++) {
            const idx = r * size + c;
            if (boxCells.includes(idx)) continue;
            if (grid[idx] === 0 && cands[idx].has(v)) {
              eliminations.push({ cell: idx, value: v });
            }
          }
          if (eliminations.length > 0) {
            return {
              technique: "pointingPair",
              eliminations,
              reasonTR: `Isaret Eden Ikili: Kutu ${boxIdx + 1} icindeki ${v} adaylari sadece ${c + 1}. sutuna yerlesebiliyor; o yuzden bu sutunun kutu disindaki hucrelerinden ${v} elenir.`,
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * boxLineReduction (kilitli aday - satir/sutun icinde): Bir satir veya sutunda
 * bir degerin tum adaylari ayni kutuda yer aliyorsa; o kutunun satir/sutun disindaki
 * hucrelerinden o deger elenir.
 */
function findBoxLineReduction(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): EliminationResult | null {
  const { size, boxRows, boxCols } = config;
  const boxesPerRow = size / boxCols;

  // Satirlar
  for (let r = 0; r < size; r++) {
    for (let v = 1; v <= size; v++) {
      const cellsWithV: number[] = [];
      let alreadyPlaced = false;
      for (let c = 0; c < size; c++) {
        const idx = r * size + c;
        if (grid[idx] === v) {
          alreadyPlaced = true;
          break;
        }
        if (grid[idx] === 0 && cands[idx].has(v)) cellsWithV.push(idx);
      }
      if (alreadyPlaced) continue;
      if (cellsWithV.length < 2) continue;

      // Hepsi ayni kutuda mi?
      const boxIds = new Set(
        cellsWithV.map((i) => {
          const cc = colOf(i, size);
          const rr = rowOf(i, size);
          return Math.floor(rr / boxRows) * boxesPerRow + Math.floor(cc / boxCols);
        })
      );
      if (boxIds.size !== 1) continue;
      const onlyBox = sortedArray(boxIds)[0];

      // Bu kutunun satir disindaki bos hucrelerinden v'yi ele.
      const br = Math.floor(onlyBox / boxesPerRow);
      const bc = onlyBox % boxesPerRow;
      const eliminations: Elimination[] = [];
      for (let rr = br * boxRows; rr < (br + 1) * boxRows; rr++) {
        if (rr === r) continue;
        for (let cc = bc * boxCols; cc < (bc + 1) * boxCols; cc++) {
          const idx = rr * size + cc;
          if (grid[idx] === 0 && cands[idx].has(v)) {
            eliminations.push({ cell: idx, value: v });
          }
        }
      }
      if (eliminations.length > 0) {
        return {
          technique: "boxLineReduction",
          eliminations,
          reasonTR: `Kutu-Satir Indirgeme: ${r + 1}. satirdaki ${v} adaylari yalnizca Kutu ${onlyBox + 1} icinde; bu yuzden o kutunun satir disindaki hucrelerinden ${v} elenir.`,
        };
      }
    }
  }

  // Sutunlar
  for (let c = 0; c < size; c++) {
    for (let v = 1; v <= size; v++) {
      const cellsWithV: number[] = [];
      let alreadyPlaced = false;
      for (let r = 0; r < size; r++) {
        const idx = r * size + c;
        if (grid[idx] === v) {
          alreadyPlaced = true;
          break;
        }
        if (grid[idx] === 0 && cands[idx].has(v)) cellsWithV.push(idx);
      }
      if (alreadyPlaced) continue;
      if (cellsWithV.length < 2) continue;

      const boxIds = new Set(
        cellsWithV.map((i) => {
          const cc = colOf(i, size);
          const rr = rowOf(i, size);
          return Math.floor(rr / boxRows) * boxesPerRow + Math.floor(cc / boxCols);
        })
      );
      if (boxIds.size !== 1) continue;
      const onlyBox = sortedArray(boxIds)[0];

      const br = Math.floor(onlyBox / boxesPerRow);
      const bc = onlyBox % boxesPerRow;
      const eliminations: Elimination[] = [];
      for (let rr = br * boxRows; rr < (br + 1) * boxRows; rr++) {
        for (let cc = bc * boxCols; cc < (bc + 1) * boxCols; cc++) {
          if (cc === c) continue;
          const idx = rr * size + cc;
          if (grid[idx] === 0 && cands[idx].has(v)) {
            eliminations.push({ cell: idx, value: v });
          }
        }
      }
      if (eliminations.length > 0) {
        return {
          technique: "boxLineReduction",
          eliminations,
          reasonTR: `Kutu-Sutun Indirgeme: ${c + 1}. sutundaki ${v} adaylari yalnizca Kutu ${onlyBox + 1} icinde; bu yuzden o kutunun sutun disindaki hucrelerinden ${v} elenir.`,
        };
      }
    }
  }
  return null;
}

/**
 * X-Wing: Bir deger v icin, iki satirin her birinde v adayi tam olarak ayni iki sutunda
 * goruluyorsa; o iki sutunun diger satirlarindaki v adaylari elenir. (Ve simetrik durum.)
 */
function findXWing(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): EliminationResult | null {
  const { size } = config;

  // Satir bazli X-Wing
  for (let v = 1; v <= size; v++) {
    // Her satir icin v'nin sigabildigi sutunlar.
    const rowCols: Map<number, number[]> = new Map();
    for (let r = 0; r < size; r++) {
      const cols: number[] = [];
      let alreadyPlaced = false;
      for (let c = 0; c < size; c++) {
        const idx = r * size + c;
        if (grid[idx] === v) {
          alreadyPlaced = true;
          break;
        }
        if (grid[idx] === 0 && cands[idx].has(v)) cols.push(c);
      }
      if (alreadyPlaced) continue;
      if (cols.length === 2) rowCols.set(r, cols);
    }

    const rows = Array.from(rowCols.keys()).sort((a, b) => a - b);
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const r1 = rows[i];
        const r2 = rows[j];
        const c1 = rowCols.get(r1)!;
        const c2 = rowCols.get(r2)!;
        if (c1[0] !== c2[0] || c1[1] !== c2[1]) continue;
        // X-Wing: c1[0] ve c1[1] sutunlarindaki diger satir hucrelerinden v elenir.
        const eliminations: Elimination[] = [];
        for (const cc of c1) {
          for (let r = 0; r < size; r++) {
            if (r === r1 || r === r2) continue;
            const idx = r * size + cc;
            if (grid[idx] === 0 && cands[idx].has(v)) {
              eliminations.push({ cell: idx, value: v });
            }
          }
        }
        if (eliminations.length > 0) {
          return {
            technique: "xWing",
            eliminations,
            reasonTR: `X-Kanat: ${v} degeri ${r1 + 1} ve ${r2 + 1}. satirlarda yalnizca ${c1[0] + 1} ve ${c1[1] + 1}. sutunlarda gorulebiliyor; bu nedenle o sutunlarin diger satirlarindan ${v} elenir.`,
          };
        }
      }
    }
  }

  // Sutun bazli X-Wing
  for (let v = 1; v <= size; v++) {
    const colRows: Map<number, number[]> = new Map();
    for (let c = 0; c < size; c++) {
      const rs: number[] = [];
      let alreadyPlaced = false;
      for (let r = 0; r < size; r++) {
        const idx = r * size + c;
        if (grid[idx] === v) {
          alreadyPlaced = true;
          break;
        }
        if (grid[idx] === 0 && cands[idx].has(v)) rs.push(r);
      }
      if (alreadyPlaced) continue;
      if (rs.length === 2) colRows.set(c, rs);
    }

    const cols = Array.from(colRows.keys()).sort((a, b) => a - b);
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const c1 = cols[i];
        const c2 = cols[j];
        const r1 = colRows.get(c1)!;
        const r2 = colRows.get(c2)!;
        if (r1[0] !== r2[0] || r1[1] !== r2[1]) continue;
        const eliminations: Elimination[] = [];
        for (const rr of r1) {
          for (let c = 0; c < size; c++) {
            if (c === c1 || c === c2) continue;
            const idx = rr * size + c;
            if (grid[idx] === 0 && cands[idx].has(v)) {
              eliminations.push({ cell: idx, value: v });
            }
          }
        }
        if (eliminations.length > 0) {
          return {
            technique: "xWing",
            eliminations,
            reasonTR: `X-Kanat: ${v} degeri ${c1 + 1} ve ${c2 + 1}. sutunlarda yalnizca ${r1[0] + 1} ve ${r1[1] + 1}. satirlarda gorulebiliyor; bu nedenle o satirlarin diger sutunlarindan ${v} elenir.`,
          };
        }
      }
    }
  }

  return null;
}

// ============================================================================
// Eleme tekniklerini sirayla deneyen yardimci.
// ============================================================================

const ELIMINATION_TECHNIQUES: Array<
  (grid: Grid, cands: Candidates, config: GameConfig) => EliminationResult | null
> = [
  // Sira: kolaydan zora.
  (g, c, cfg) => findNakedSubset(g, c, cfg, 2),
  findPointingPair,
  findBoxLineReduction,
  findHiddenPair,
  (g, c, cfg) => findNakedSubset(g, c, cfg, 3),
  findXWing,
];

/**
 * Adaylari elemeyi dener, bir teknik bir eleme yaparsa onu uygular ve
 * uygulanan teknigi geri doner. Hicbir teknik elemiyorsa null.
 */
function applyOneElimination(
  grid: Grid,
  cands: Candidates,
  config: GameConfig
): EliminationResult | null {
  for (const technique of ELIMINATION_TECHNIQUES) {
    const result = technique(grid, cands, config);
    if (result && result.eliminations.length > 0) {
      for (const e of result.eliminations) {
        cands[e.cell].delete(e.value);
      }
      return result;
    }
  }
  return null;
}

// ============================================================================
// Public API: nextHint, solveLogically
// ============================================================================

/**
 * Bir sonraki kullanilabilir ipucunu doner.
 * Strateji:
 *   1) nakedSingle
 *   2) hiddenSingle
 *   3) Eleme tekniklerinden birini uygula -> sonra naked/hidden single ara ->
 *      ortaya cikan single'i o teknigin adi ile dondur.
 *   4) Hicbir ilerleme olmuyorsa null.
 */
export function nextHint(grid: Grid, config: GameConfig): Hint | null {
  const cands = buildCandidates(grid, config);

  // Adim 1: nakedSingle
  const ns = findNakedSingle(grid, cands, config);
  if (ns) return ns;

  // Adim 2: hiddenSingle
  const hs = findHiddenSingle(grid, cands, config);
  if (hs) return hs;

  // Adim 3: Eleme tekniklerini sirayla uygula; her elemeden sonra single ara.
  // Bir teknik basarisiz olsa bile, sonraki teknige gecmeden once
  // tum elemeleri biriktirip single olusana dek devam edebiliriz.
  // Cogu durumda bir eleme tek single uretmeye yetmez.
  let lastTechnique: string | null = null;
  let lastReason: string | null = null;
  for (let safety = 0; safety < grid.length * 8; safety++) {
    const elim = applyOneElimination(grid, cands, config);
    if (!elim) break;
    lastTechnique = elim.technique;
    lastReason = elim.reasonTR;

    // Eleme sonrasi single ortaya cikti mi?
    const ns2 = findNakedSingle(grid, cands, config);
    if (ns2) {
      // Hint'i o teknige atfet (oyuncuya neden bunu yaptigimizi soyleyelim).
      return {
        technique: lastTechnique,
        index: ns2.index,
        value: ns2.value,
        explanationTR: `${lastReason} Bu eleme sonrasi (${rowOf(ns2.index, config.size) + 1}, ${colOf(ns2.index, config.size) + 1}) hucresinde tek aday olarak ${ns2.value} kaliyor.`,
      };
    }
    const hs2 = findHiddenSingle(grid, cands, config);
    if (hs2) {
      return {
        technique: lastTechnique,
        index: hs2.index,
        value: hs2.value,
        explanationTR: `${lastReason} Bu eleme sonrasi (${rowOf(hs2.index, config.size) + 1}, ${colOf(hs2.index, config.size) + 1}) hucresine ${hs2.value} yazilir.`,
      };
    }
    // Single olusmadi - bir sonraki eleme turuna gec.
  }

  return null;
}

/** solveLogically icin donus tipi. */
export interface LogicalSolveResult {
  solved: boolean;
  /** En zor (en yuksek rank'li) kullanilan teknik. Hicbir teknik kullanilmadiysa "" */
  hardestTechnique: string;
  /** Yerlestirilen toplam adim sayisi. */
  steps: number;
  /** Tahminsiz cozumun ortaya cikan grid'i (kismi olabilir, solved=false ise). */
  grid: Grid;
}

/**
 * Tahminsiz (backtracking'siz) mantiksal cozme.
 * Tekrar tekrar nextHint uygulayarak ilerler. Cozulurse solved=true.
 * Tikanirsa, o ana kadarki ilerlemeyi ve en zor teknigi doner.
 */
export function solveLogically(
  grid: Grid,
  config: GameConfig
): LogicalSolveResult {
  const work = grid.slice();
  let hardest = "";
  let hardestRank = 0;
  let steps = 0;

  for (let safety = 0; safety < work.length * 4; safety++) {
    // Bos hucre var mi?
    let hasEmpty = false;
    for (let i = 0; i < work.length; i++) {
      if (work[i] === 0) {
        hasEmpty = true;
        break;
      }
    }
    if (!hasEmpty) {
      return { solved: true, hardestTechnique: hardest, steps, grid: work };
    }

    const h = nextHint(work, config);
    if (!h) {
      return { solved: false, hardestTechnique: hardest, steps, grid: work };
    }

    work[h.index] = h.value;
    steps++;
    const rank = TECHNIQUE_RANK[h.technique] ?? 0;
    if (rank > hardestRank) {
      hardestRank = rank;
      hardest = h.technique;
    }
  }

  // Guvenlik snir; pratikte buraya gelinmemeli.
  return { solved: false, hardestTechnique: hardest, steps, grid: work };
}

// ============================================================================
// Kucuk yardimci: k-li kombinasyonlar (deterministik, sirali girdi varsayar).
// ============================================================================
function kCombinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const n = arr.length;
  if (k > n || k <= 0) return result;
  const idx = new Array(k);
  for (let i = 0; i < k; i++) idx[i] = i;
  while (true) {
    result.push(idx.map((i) => arr[i]));
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
  return result;
}
