import { describe, expect, it } from "vitest";
import { symbolFor, valuesForSize } from "../symbols";

describe("symbolFor", () => {
  it("0 bos string", () => {
    expect(symbolFor(0)).toBe("");
  });
  it("1..9 rakam string'i", () => {
    expect(symbolFor(1)).toBe("1");
    expect(symbolFor(9)).toBe("9");
  });
  it("10..16 A..G", () => {
    expect(symbolFor(10)).toBe("A");
    expect(symbolFor(16)).toBe("G");
  });
});

describe("valuesForSize", () => {
  it("4 -> [1,2,3,4]", () => {
    expect(valuesForSize(4)).toEqual([1, 2, 3, 4]);
  });
  it("9 dondurdugu liste 9 elemanli", () => {
    expect(valuesForSize(9).length).toBe(9);
  });
  it("16 -> 1..16", () => {
    const v = valuesForSize(16);
    expect(v[0]).toBe(1);
    expect(v[15]).toBe(16);
    expect(v.length).toBe(16);
  });
});
