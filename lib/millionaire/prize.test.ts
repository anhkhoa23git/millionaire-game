import { describe, it, expect } from "vitest";
import {
  safeHavenLevels,
  sortedSafeHavens,
  firstSafeHavenLevel,
  middleVideoLevel,
  buildPrizeLadder,
} from "./prize";

describe("safeHavenLevels", () => {
  it("matches the classic show at 15 questions (5/10/15)", () => {
    expect([...safeHavenLevels(15)].sort((a, b) => a - b)).toEqual([5, 10, 15]);
  });
  it("9 questions -> 3/6/9", () => {
    expect([...safeHavenLevels(9)].sort((a, b) => a - b)).toEqual([3, 6, 9]);
  });
  it("6 questions -> 2/4/6", () => {
    expect([...safeHavenLevels(6)].sort((a, b) => a - b)).toEqual([2, 4, 6]);
  });
  it("12 questions -> 4/8/12", () => {
    expect([...safeHavenLevels(12)].sort((a, b) => a - b)).toEqual([4, 8, 12]);
  });
});

describe("middleVideoLevel (safe haven #2)", () => {
  it("is the second safe haven", () => {
    expect(middleVideoLevel(9)).toBe(6);
    expect(middleVideoLevel(15)).toBe(10);
    expect(middleVideoLevel(12)).toBe(8);
    expect(middleVideoLevel(6)).toBe(4);
  });
});

describe("firstSafeHavenLevel (moc3 audio)", () => {
  it("is the first safe haven", () => {
    expect(firstSafeHavenLevel(9)).toBe(3);
    expect(firstSafeHavenLevel(15)).toBe(5);
    expect(firstSafeHavenLevel(6)).toBe(2);
  });
});

describe("buildPrizeLadder", () => {
  it("respects a pinned top prize and halves backwards", () => {
    const ladder = buildPrizeLadder(3, 1_000_000);
    expect(ladder[2].amount).toBe(1_000_000);
    // each earlier step is strictly less than the next
    for (let i = 0; i < ladder.length - 1; i++) {
      expect(ladder[i].amount).toBeLessThan(ladder[i + 1].amount);
    }
  });

  it("marks the correct safe-haven flags", () => {
    const ladder = buildPrizeLadder(15, 0);
    const safeLevels = ladder.filter((s) => s.safe).map((s) => s.level);
    expect(safeLevels).toEqual([5, 10, 15]);
  });

  it("auto ladder for 9 questions has 9 steps", () => {
    expect(buildPrizeLadder(9, 0)).toHaveLength(9);
  });
});
