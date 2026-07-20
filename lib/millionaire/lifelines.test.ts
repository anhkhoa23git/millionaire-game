import { describe, it, expect } from "vitest";
import {
  computeFiftyFiftyDisabled,
  isBlockedLifelineCombo,
  simulateAudiencePoll,
} from "./lifelines";

describe("computeFiftyFiftyDisabled", () => {
  it("disables exactly 2 wrong answers, keeps correct + 1 wrong visible", () => {
    // deterministic rng: always picks index 0 then 1 from the shuffled wrong list
    const rng = () => 0;
    const disabled = computeFiftyFiftyDisabled(0, new Set<number>(), rng);
    // correct = 0 must stay enabled
    expect(disabled.has(0)).toBe(false);
    // exactly 2 of the wrong indices (1,2,3) are disabled
    const wrongDisabled = [1, 2, 3].filter((i) => disabled.has(i));
    expect(wrongDisabled.length).toBe(2);
    // merges with pre-existing disabled
    const merged = computeFiftyFiftyDisabled(2, new Set([9]), rng);
    expect(merged.has(9)).toBe(true);
  });

  it("is deterministic given the same rng", () => {
    const a = computeFiftyFiftyDisabled(1, new Set<number>(), () => 0.5);
    const b = computeFiftyFiftyDisabled(1, new Set<number>(), () => 0.5);
    expect([...a].sort()).toEqual([...b].sort());
  });
});

describe("isBlockedLifelineCombo", () => {
  it("blocks double dip when 50:50 already used", () => {
    expect(isBlockedLifelineCombo("double", true, false)).toBe(true);
  });
  it("blocks 50:50 when double dip active", () => {
    expect(isBlockedLifelineCombo("fifty", false, true)).toBe(true);
  });
  it("allows either when no conflict", () => {
    expect(isBlockedLifelineCombo("double", false, false)).toBe(false);
    expect(isBlockedLifelineCombo("fifty", false, false)).toBe(false);
    expect(isBlockedLifelineCombo("audience", true, true)).toBe(false);
  });
});

describe("simulateAudiencePoll", () => {
  it("gives the correct answer the majority and sums to 100", () => {
    const poll = simulateAudiencePoll(2);
    expect(poll.length).toBe(4);
    expect(poll[2]).toBeGreaterThanOrEqual(60);
    expect(poll.reduce((a, b) => a + b, 0)).toBe(100);
  });
});
