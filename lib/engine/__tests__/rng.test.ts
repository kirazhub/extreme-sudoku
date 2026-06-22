import { describe, it, expect } from "vitest";
import { makeRng, shuffle } from "../rng";

describe("rng", () => {
  it("ayni seed ayni dizi", () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("farkli seed farkli dizi", () => {
    const a = makeRng(1);
    const b = makeRng(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it("uretilen sayilar [0,1) araliginda", () => {
    const r = makeRng(123);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("shuffle deterministik (ayni seed -> ayni sira)", () => {
    const r1 = makeRng(7);
    const r2 = makeRng(7);
    const arr1 = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r1);
    const arr2 = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r2);
    expect(arr1).toEqual(arr2);
  });

  it("shuffle ayni elemanlari icerir", () => {
    const r = makeRng(99);
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = shuffle(original, r);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(original);
  });
});
