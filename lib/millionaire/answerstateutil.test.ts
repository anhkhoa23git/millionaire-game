import { describe, it, expect } from "vitest";
import { getAnswerState, type AnswerStateInput } from "@/lib/millionaire/answerStateUtil";
import type { Question } from "@/lib/millionaire/questions";

const makeQuestion = (correct: 0 | 1 | 2 | 3): Question => ({
  question: "Test?",
  answers: ["A", "B", "C", "D"],
  correct,
});

const base = (over: Partial<AnswerStateInput> = {}): AnswerStateInput => ({
  revealState: "idle",
  disabledAnswers: new Set(),
  selectedAnswer: null,
  question: makeQuestion(2),
  ...over,
});

describe("getAnswerState", () => {
  it("returns disabled when the index is in disabledAnswers", () => {
    const input = base({ disabledAnswers: new Set([0]) });
    expect(getAnswerState(0, input)).toBe("disabled");
  });

  it("returns default when idle and nothing selected", () => {
    expect(getAnswerState(3, base())).toBe("default");
  });

  it("returns selected for the chosen answer", () => {
    const input = base({ selectedAnswer: 1, revealState: "selected" });
    expect(getAnswerState(1, input)).toBe("selected");
    expect(getAnswerState(0, input)).toBe("default");
  });

  it("marks the correct box green on correct reveal", () => {
    const input = base({ revealState: "correct" });
    expect(getAnswerState(2, input)).toBe("correct");
    expect(getAnswerState(0, input)).toBe("default");
  });

  it("on wrong reveal: picked answer is wrong, correct answer is correct", () => {
    const input = base({ revealState: "wrong", selectedAnswer: 1 });
    expect(getAnswerState(1, input)).toBe("wrong");
    expect(getAnswerState(2, input)).toBe("correct"); // correct box still shown
    expect(getAnswerState(0, input)).toBe("default");
  });

  it("on double-dip first miss: only the picked answer is marked wrong", () => {
    const input = base({ revealState: "dip_wrong", selectedAnswer: 1 });
    expect(getAnswerState(1, input)).toBe("wrong");
    expect(getAnswerState(2, input)).toBe("default"); // correct answer stays secret
  });
});
