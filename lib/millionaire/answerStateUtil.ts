// Pure helper: given the current reveal state + selection, what visual state
// should answer box `idx` show? Kept outside the component so it is trivial
// to unit-test and reuse.

import { AnswerState } from "@/lib/millionaire/state";
import { Question } from "@/lib/millionaire/questions";

export interface AnswerStateInput {
  revealState:
    | "idle"
    | "selected"
    | "revealing"
    | "correct"
    | "wrong"
    | "dip_wrong";
  disabledAnswers: Set<number>;
  selectedAnswer: number | null;
  question: Question;
}

export function getAnswerState(idx: number, input: AnswerStateInput): AnswerState {
  const { revealState, disabledAnswers, selectedAnswer, question } = input;
  if (disabledAnswers.has(idx)) return "disabled";
  if (revealState === "correct" && idx === question.correct) return "correct";
  if (revealState === "wrong") {
    if (idx === selectedAnswer) return "wrong";
    if (idx === question.correct) return "correct";
  }
  // Double Dip first miss: mark the pick wrong but keep the answer secret
  if (revealState === "dip_wrong" && idx === selectedAnswer) return "wrong";
  if (selectedAnswer === idx) return "selected";
  return "default";
}
