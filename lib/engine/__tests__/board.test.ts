import { describe, it, expect } from "vitest";
import {
  createEmpty,
  cloneGrid,
  getCell,
  setCell,
  fromString,
  toString as gridToString,
  filledCount,
  isFull,
} from "../board";
import { configForSize } from "../geometry";

describe("board", () => {
  it("createEmpty: size*size uzunlukta 0'larla dolu", () => {
    const c = configForSize(9);
    const g = createEmpty(c);
    expect(g.length).toBe(81);
    expect(g.every((v) => v === 0)).toBe(true);
  });

  it("cloneGrid bagimsiz kopya doner", () => {
    const c = configForSize(4);
    const g = createEmpty(c);
    g[0] = 1;
    const copy = cloneGrid(g);
    copy[0] = 2;
    expect(g[0]).toBe(1);
    expect(copy[0]).toBe(2);
  });

  it("getCell/setCell calisir", () => {
    const c = configForSize(9);
    const g = createEmpty(c);
    setCell(g, 0, 0, 5, c);
    expect(getCell(g, 0, 0, c)).toBe(5);
    setCell(g, 8, 8, 9, c);
    expect(getCell(g, 8, 8, c)).toBe(9);
  });

  it("filledCount ve isFull", () => {
    const c = configForSize(4);
    const g = createEmpty(c);
    expect(filledCount(g)).toBe(0);
    expect(isFull(g)).toBe(false);
    for (let i = 0; i < g.length; i++) g[i] = 1;
    expect(filledCount(g)).toBe(16);
    expect(isFull(g)).toBe(true);
  });

  it("toString/fromString round-trip (9x9)", () => {
    const c = configForSize(9);
    const g = createEmpty(c);
    g[0] = 5;
    g[1] = 3;
    g[4] = 7;
    g[9] = 6;
    const s = gridToString(g, c);
    const g2 = fromString(s, c);
    expect(Array.from(g2)).toEqual(Array.from(g));
  });

  it("toString/fromString round-trip (16x16) - 16 destegi", () => {
    const c = configForSize(16);
    const g = createEmpty(c);
    g[0] = 16;
    g[1] = 1;
    g[10] = 11;
    g[255] = 8;
    const s = gridToString(g, c);
    const g2 = fromString(s, c);
    expect(Array.from(g2)).toEqual(Array.from(g));
  });
});
