// Sudoku motorunun temel tipleri (saf TS, hicbir framework bagimliligi yok).

/** Tek hucre degeri. 0 = bos, aksi halde 1..size. */
export type Cell = number;

/** Sudoku tahtasi: satir bazinda duz dizi, size*size uzunlukta. */
export type Grid = number[];

/** Tahta geometrisi: boyut + kutu satir/sutun olculeri. */
export interface GameConfig {
  /** Tahta kenar uzunlugu (4, 6, 9, 16). */
  size: number;
  /** Bir kutudaki satir sayisi. */
  boxRows: number;
  /** Bir kutudaki sutun sayisi. */
  boxCols: number;
}

/** Oyun zorluk seviyeleri. */
export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "extreme"
  | "impossible";

/** Mantiksal cozucu tarafindan onerilen bir ipucu. */
export interface Hint {
  /** Kullanilan teknik ad: "nakedSingle" | "hiddenSingle" | ... */
  technique: string;
  /** Onerilen hucrenin duz indeksi. */
  index: number;
  /** O hucreye yazilmasi onerilen deger. */
  value: number;
  /** Kullaniciya gosterilecek Turkce aciklama. */
  explanationTR: string;
}

/** Uretilmis tam bir bulmaca paketi. */
export interface Puzzle {
  /** Baslangic verileri: bos hucreler 0 olarak. */
  givens: Grid;
  /** Bulmacanin (benzersiz) tam cozumu. */
  solution: Grid;
  /** Hangi geometriyle uretildi. */
  config: GameConfig;
  /** Hangi zorluk hedeflenerek uretildi. */
  difficulty: Difficulty;
}
