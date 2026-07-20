import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  runCorrectSequence,
  runWrongSequence,
  runDoubleDipMiss,
  suspenseDuration,
  type GameplayDeps,
} from "./revealphases";
import type { Question } from "./questions";
import type { PrizeStep } from "./prize";

const Q: Question = { question: "Q", answers: ["A", "B", "C", "D"], correct: 0 };

function makeDeps(overrides: Partial<GameplayDeps> = {}): GameplayDeps {
  const timers: ReturnType<typeof setTimeout>[] = [];
  return {
    question: Q,
    step: { level: 1, amount: 100, safe: false },
    currentLevel: 1,
    totalQuestions: 9,
    selectedAnswer: 0,
    doubleDipActive: false,
    doubleDipGuessesLeft: 0,
    disabledAnswers: new Set<number>(),
    schedule: (fn, ms) => {
      timers.push(setTimeout(fn, ms));
    },
    setRevealState: vi.fn(),
    setSelectedAnswer: vi.fn(),
    setFadeOutContent: vi.fn(),
    setSafeHavenAmount: vi.fn(),
    setShowSafeHavenFrame: vi.fn(),
    setShowSafeHavenMoneyLadder: vi.fn(),
    setShowMiddleVideo: vi.fn(),
    setDisabledAnswers: vi.fn(),
    setDoubleDipActive: vi.fn(),
    setDoubleDipGuessesLeft: vi.fn(),
    onCorrect: vi.fn(),
    onWrong: vi.fn(),
    makeSkippable: (finish) => {
      // In tests, skippable just runs finish immediately when invoked.
      const run = () => finish();
      return run;
    },
    ...overrides,
  } as GameplayDeps;
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("suspenseDuration", () => {
  it("is at least SUSPENSE_MIN_MS and grows with level", () => {
    const early = suspenseDuration(1, 9);
    const late = suspenseDuration(9, 9);
    expect(early).toBeLessThanOrEqual(late);
    expect(early).toBeGreaterThanOrEqual(1500);
  });
});

describe("runCorrectSequence", () => {
  it("ordinary level -> fades out then calls onCorrect", () => {
    const d = makeDeps({ step: { level: 1, amount: 100, safe: false } });
    runCorrectSequence(d);
    vi.advanceTimersByTime(10_000);
    expect(d.onCorrect).toHaveBeenCalledWith(2);
    expect(d.setShowMiddleVideo).not.toHaveBeenCalled();
  });

  it("level 6 safe haven -> mounts middle video", () => {
    const d = makeDeps({
      currentLevel: 6,
      step: { level: 6, amount: 1000, safe: true },
    });
    runCorrectSequence(d);
    vi.advanceTimersByTime(10_000);
    expect(d.setShowMiddleVideo).toHaveBeenCalledWith(true);
    expect(d.onCorrect).not.toHaveBeenCalled();
  });
});

describe("runWrongSequence", () => {
  it("calls onWrong after the reveal window", () => {
    const d = makeDeps();
    runWrongSequence(d);
    // makeSkippable runs finish immediately in test, so onWrong is queued
    // inside the scheduled callback (WRONG_REVEAL_MS).
    vi.advanceTimersByTime(4000);
    expect(d.onWrong).toHaveBeenCalledTimes(1);
  });
});

describe("runDoubleDipMiss", () => {
  it("disables the picked answer and decrements guesses", () => {
    const d = makeDeps({
      selectedAnswer: 2,
      doubleDipActive: true,
      doubleDipGuessesLeft: 2,
      disabledAnswers: new Set<number>([3]),
    });
    runDoubleDipMiss(d);
    vi.advanceTimersByTime(3000);
    expect(d.setDisabledAnswers).toHaveBeenCalledWith(new Set([3, 2]));
    expect(d.setDoubleDipGuessesLeft).toHaveBeenCalledWith(1);
    expect(d.setRevealState).toHaveBeenCalledWith("idle");
  });
});
