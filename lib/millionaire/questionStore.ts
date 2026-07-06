// Question persistence — localStorage-backed, falls back to DEFAULT_QUESTIONS.

import { Question, DEFAULT_QUESTIONS } from "./questions";

const STORAGE_KEY = "millionaire.questions.v1";
export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 30;

export function validateQuestion(q: unknown): q is Question {
  if (typeof q !== "object" || q === null) return false;
  const obj = q as Record<string, unknown>;
  return (
    typeof obj.question === "string" &&
    obj.question.trim().length > 0 &&
    Array.isArray(obj.answers) &&
    obj.answers.length === 4 &&
    obj.answers.every((a) => typeof a === "string" && a.trim().length > 0) &&
    typeof obj.correct === "number" &&
    [0, 1, 2, 3].includes(obj.correct)
  );
}

export function validateQuestionSet(qs: unknown): qs is Question[] {
  return (
    Array.isArray(qs) &&
    qs.length >= MIN_QUESTIONS &&
    qs.length <= MAX_QUESTIONS &&
    qs.every(validateQuestion)
  );
}

// Strip legacy/extra fields so stored data stays canonical
function normalize(q: Question): Question {
  return {
    question: q.question.trim(),
    answers: [
      q.answers[0].trim(),
      q.answers[1].trim(),
      q.answers[2].trim(),
      q.answers[3].trim(),
    ],
    correct: q.correct,
  };
}

export function loadQuestions(): Question[] {
  if (typeof window === "undefined") return DEFAULT_QUESTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUESTIONS;
    const parsed = JSON.parse(raw);
    if (validateQuestionSet(parsed)) return parsed.map(normalize);
  } catch (err) {
    console.warn("Failed to load custom questions, using defaults:", err);
  }
  return DEFAULT_QUESTIONS;
}

export function saveQuestions(questions: Question[]): boolean {
  if (typeof window === "undefined") return false;
  if (!validateQuestionSet(questions)) return false;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(questions.map(normalize))
    );
    return true;
  } catch (err) {
    console.error("Failed to save questions:", err);
    return false;
  }
}

export function resetToDefault(): Question[] {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return DEFAULT_QUESTIONS;
}

export function exportJson(questions: Question[]): string {
  return JSON.stringify(questions, null, 2);
}

export function importJson(raw: string): Question[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (validateQuestionSet(parsed)) return parsed.map(normalize);
  } catch {
    // fall through
  }
  return null;
}
