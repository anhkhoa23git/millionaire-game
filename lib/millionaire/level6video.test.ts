import { describe, it, expect, vi } from "vitest";
import {
  continueFromMoneyLadder,
  onMiddleVideoEnd,
  onMiddleIntroClick,
  onDarknessVideoEnd,
  type Level6Deps,
} from "./level6video";
import { middleVideoLevel } from "./prize";

function makeDeps(overrides: Partial<Level6Deps> = {}): Level6Deps {
  return {
    currentLevel: 3,
    totalQuestions: 9,
    doubleDipActive: false,
    setShowSafeHavenMoneyLadder: vi.fn(),
    setFadeOutContent: vi.fn(),
    setShowMiddleVideo: vi.fn(),
    setShowMiddleIntro: vi.fn(),
    setShowDarknessVideo: vi.fn(),
    setLevel6SafeHavenLevel: vi.fn(),
    setDoubleDipActive: vi.fn(),
    setDoubleDipGuessesLeft: vi.fn(),
    onCorrect: vi.fn(),
    ...overrides,
  } as Level6Deps;
}

describe("continueFromMoneyLadder", () => {
  it("normal level -> onCorrect(next)", () => {
    const d = makeDeps({ currentLevel: 3 });
    continueFromMoneyLadder(d);
    expect(d.onCorrect).toHaveBeenCalledWith(4);
    expect(d.setShowDarknessVideo).not.toHaveBeenCalled();
  });

  it("level 6 -> shows darkness video, does not advance", () => {
    const d = makeDeps({ currentLevel: middleVideoLevel(9), doubleDipActive: true, totalQuestions: 9 });
    continueFromMoneyLadder(d);
    expect(d.setShowDarknessVideo).toHaveBeenCalledWith(true);
    expect(d.onCorrect).not.toHaveBeenCalled();
    // double dip cleared
    expect(d.setDoubleDipActive).toHaveBeenCalledWith(false);
  });
});

describe("level 6 video chain", () => {
  it("onMiddleVideoEnd -> intro shown, video hidden", () => {
    const d = makeDeps();
    onMiddleVideoEnd(d);
    expect(d.setShowMiddleVideo).toHaveBeenCalledWith(false);
    expect(d.setShowMiddleIntro).toHaveBeenCalledWith(true);
  });

  it("onMiddleIntroClick -> money ladder shown, level set to 6", () => {
    const d = makeDeps();
    onMiddleIntroClick(d);
    expect(d.setShowMiddleIntro).toHaveBeenCalledWith(false);
    expect(d.setShowSafeHavenMoneyLadder).toHaveBeenCalledWith(true);
    expect(d.setLevel6SafeHavenLevel).toHaveBeenCalledWith(6);
  });

  it("onDarknessVideoEnd -> advances and clears double dip", () => {
    const d = makeDeps({ currentLevel: 6, doubleDipActive: true });
    onDarknessVideoEnd(d);
    expect(d.setShowDarknessVideo).toHaveBeenCalledWith(false);
    expect(d.onCorrect).toHaveBeenCalledWith(7);
  });
});
