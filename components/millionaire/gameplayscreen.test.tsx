import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { GameplayScreen } from "@/components/millionaire/GameplayScreen";
import { buildPrizeLadder } from "@/lib/millionaire/prize";
import type { Question } from "@/lib/millionaire/questions";
import type { GameSettings } from "@/lib/millionaire/settings";
import type { ContestantInfo } from "@/lib/millionaire/state";
import type { LifelineId } from "@/lib/millionaire/lifelines";

const QUESTIONS: Question[] = [
  { question: "Q1", answers: ["A", "B", "C", "D"], correct: 0 },
  { question: "Q2", answers: ["A", "B", "C", "D"], correct: 1 },
  { question: "Q3", answers: ["A", "B", "C", "D"], correct: 2 },
  { question: "Q4", answers: ["A", "B", "C", "D"], correct: 3 },
  { question: "Q5", answers: ["A", "B", "C", "D"], correct: 0 },
  { question: "Q6", answers: ["A", "B", "C", "D"], correct: 1 },
  { question: "Q7", answers: ["A", "B", "C", "D"], correct: 2 },
  { question: "Q8", answers: ["A", "B", "C", "D"], correct: 3 },
  { question: "Q9", answers: ["A", "B", "C", "D"], correct: 0 },
];

const SETTINGS: GameSettings = {
  timerEnabled: false, // disable timer so tests are deterministic
  timerBaseSeconds: 30,
  sfxVolume: 0.7,
  musicVolume: 0.6,
  topPrize: 0,
  totalQuestions: QUESTIONS.length,
};

const CONTESTANT: ContestantInfo = { name: "Test", location: "HN" };

function baseProps(over: Record<string, unknown> = {}) {
  const ladder = buildPrizeLadder(QUESTIONS.length, 0);
  return {
    questions: QUESTIONS,
    ladder,
    settings: SETTINGS,
    contestant: CONTESTANT,
    currentLevel: 1,
    usedLifelines: new Set<LifelineId>(),
    onUseLifeline: vi.fn(),
    onCorrect: vi.fn(),
    onWrong: vi.fn(),
    onTimeout: vi.fn(),
    onWalkAway: vi.fn(),
    disabledAnswers: new Set<number>(),
    setDisabledAnswers: vi.fn(),
    doubleDipActive: false,
    setDoubleDipActive: vi.fn(),
    doubleDipGuessesLeft: 0,
    setDoubleDipGuessesLeft: vi.fn(),
    ...over,
  };
}

function clickAnswer(container: HTMLElement, index: number) {
  const buttons = container.querySelectorAll<HTMLButtonElement>(".answer-box");
  fireEvent.click(buttons[index]);
}

describe("GameplayScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders the current question and four answers", () => {
    const { container } = render(<GameplayScreen {...baseProps()} />);
    expect(screen.getByText("Q1")).toBeInTheDocument();
    const buttons = container.querySelectorAll(".answer-box");
    expect(buttons).toHaveLength(4);
  });

  it("correct answer on a non-safe-haven level calls onCorrect after reveal", () => {
    const onCorrect = vi.fn();
    const { container } = render(<GameplayScreen {...baseProps({ currentLevel: 1, onCorrect })} />);
    clickAnswer(container, 0); // correct = index 0
    fireEvent.click(screen.getByRole("button", { name: /final answer/i }));
    act(() => {
      vi.advanceTimersByTime(1500 + 2000 + 2500 + 1000 + 3000);
    });
    expect(onCorrect).toHaveBeenCalledWith(2);
  });

  it("level 6 correct answer triggers the middle video sequence", () => {
    const { container } = render(<GameplayScreen {...baseProps({ currentLevel: 6 })} />);
    clickAnswer(container, 1); // Q6 correct = index 1
    fireEvent.click(screen.getByRole("button", { name: /final answer/i }));
    act(() => {
      vi.advanceTimersByTime(1500 + 2000 + 2500 + 1000 + 5000);
    });
    // MiddleVideoScreen mounts (class is unique to that component)
    expect(document.querySelector(".middle-video-screen")).not.toBeNull();
  });

  it("wrong answer calls onWrong", () => {
    const onWrong = vi.fn();
    const { container } = render(
      <GameplayScreen {...baseProps({ currentLevel: 1, onWrong })} />
    );
    clickAnswer(container, 1); // index 1 is WRONG for Q1 (correct=0)
    fireEvent.click(screen.getByRole("button", { name: /final answer/i }));
    act(() => {
      vi.advanceTimersByTime(1500 + 3000);
    });
    expect(onWrong).toHaveBeenCalled();
  });
});
