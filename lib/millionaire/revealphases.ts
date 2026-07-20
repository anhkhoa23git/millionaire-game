// Gameplay reveal phases — extracted from GameplayScreen so the timeout
// chains live in one audited place instead of a 200-line callback.
//
// Every phase is driven by `schedule(fn, ms)` (the component's timer pool)
// and a set of state setters / callbacks gathered in `GameplayDeps`. The
// functions are deliberately plain (not React hooks) so they can be unit
// tested without rendering the full screen.

import { audioManager } from "./audio";
import {
  REVEAL_TEXT_HIDE_MS,
  SUSPENSE_MIN_MS,
  SUSPENSE_MAX_BONUS_MS,
  SAFE_HAVEN_FADE_OUT_MS,
  SAFE_HAVEN_FRAME_SHOW_DELAY_MS,
  SAFE_HAVEN_FRAME_VISIBLE_MS,
  SAFE_HAVEN_FRAME_ORDINARY_MS,
  MOC3_MONEY_LADDER_DELAY_MS,
  WRONG_REVEAL_MS,
  DOUBLE_DIP_FIRST_MISS_MS,
} from "./gameTuning";
import { Question } from "./questions";
import { PrizeStep } from "./prize";

export interface GameplayDeps {
  // context
  question: Question;
  step: PrizeStep | undefined;
  currentLevel: number;
  totalQuestions: number;
  selectedAnswer: number;
  // dynamic special levels (depend on totalQuestions)
  firstSafeHavenLevel: number;
  middleVideoLevel: number;
  // double dip state
  doubleDipActive: boolean;
  doubleDipGuessesLeft: number;
  disabledAnswers: Set<number>;
  // timer
  schedule: (fn: () => void, ms: number) => void;
  // state setters
  setRevealState: (s: RevealStateValue) => void;
  setSelectedAnswer: (n: number | null) => void;
  setFadeOutContent: (v: boolean) => void;
  setSafeHavenAmount: (n: number) => void;
  setShowSafeHavenFrame: (v: boolean) => void;
  setShowSafeHavenMoneyLadder: (v: boolean) => void;
  setShowMiddleVideo: (v: boolean) => void;
  setDisabledAnswers: (s: Set<number>) => void;
  setDoubleDipActive: (v: boolean) => void;
  setDoubleDipGuessesLeft: (n: number) => void;
  // callbacks
  onCorrect: (newLevel: number) => void;
  onWrong: () => void;
  // skippable wrapper (used by wrong / double-dip paths)
  makeSkippable: (finish: () => void) => () => void;
}

// Subset of the component's RevealState that phases are allowed to set.
export type RevealStateValue =
  | "idle"
  | "revealing"
  | "correct"
  | "wrong"
  | "dip_wrong";

// Level 3 special audio (moc3 intro clip). Kept here so the phase logic
// stays in one file; failures are non-fatal (audio only).
function playMoc3Intro() {
  const moc3Audio = new Audio("/moc3.mp3");
  moc3Audio.play().catch((e) => console.error("moc3 play failed:", e));
  moc3Audio.addEventListener("ended", () => {
    const mocintroAudio = new Audio("/mocintro.mp3");
    mocintroAudio.play().catch((e) => console.error("mocintro play failed:", e));
  });
}

function clearDoubleDip(deps: GameplayDeps) {
  if (deps.doubleDipActive) {
    deps.setDoubleDipActive(false);
    deps.setDoubleDipGuessesLeft(0);
  }
}

// Correct-answer path: reveal green, then either a safe-haven frame
// (levels 3 / 6 / final) or a short ordinary frame on other levels.
export function runCorrectSequence(deps: GameplayDeps) {
  const { step, currentLevel, totalQuestions, schedule, setRevealState } = deps;

  setRevealState("correct");
  audioManager.music("dapandung");

  // Hide reveal text after a beat
  schedule(() => setRevealState("idle"), REVEAL_TEXT_HIDE_MS);

  const isSafeHavenStop = (step?.safe ?? false) && currentLevel < totalQuestions;

  if (isSafeHavenStop) {
    runSafeHavenFrame(deps);
  } else {
    runOrdinaryFrame(deps);
  }
}

function runSafeHavenFrame(deps: GameplayDeps) {
  const { currentLevel, step, schedule, setFadeOutContent, firstSafeHavenLevel, middleVideoLevel } = deps;

  schedule(() => {
    if (currentLevel === firstSafeHavenLevel) playMoc3Intro();

    setFadeOutContent(true);
    schedule(() => {
      deps.setSafeHavenAmount(step!.amount);
      deps.setShowSafeHavenFrame(true);
      schedule(() => {
        deps.setShowSafeHavenFrame(false);

        if (currentLevel === firstSafeHavenLevel) {
          // Wait for moc3 intro to finish before showing the money ladder
          schedule(() => deps.setShowSafeHavenMoneyLadder(true), MOC3_MONEY_LADDER_DELAY_MS);
        } else if (currentLevel === middleVideoLevel) {
          // Middle video sequence (safe haven #2)
          deps.setFadeOutContent(false);
          deps.setShowMiddleVideo(true);
        } else {
          deps.setFadeOutContent(false);
          clearDoubleDip(deps);
          deps.onCorrect(currentLevel + 1);
        }
      }, SAFE_HAVEN_FRAME_VISIBLE_MS);
    }, SAFE_HAVEN_FADE_OUT_MS);
  }, SAFE_HAVEN_FRAME_SHOW_DELAY_MS);
}

function runOrdinaryFrame(deps: GameplayDeps) {
  const { schedule, setFadeOutContent } = deps;
  schedule(() => {
    setFadeOutContent(true);
    schedule(() => {
      deps.setSafeHavenAmount(deps.step!.amount);
      deps.setShowSafeHavenFrame(true);
      schedule(() => {
        deps.setShowSafeHavenFrame(false);
        deps.setFadeOutContent(false);
        clearDoubleDip(deps);
        deps.onCorrect(deps.currentLevel + 1);
      }, SAFE_HAVEN_FRAME_ORDINARY_MS);
    }, SAFE_HAVEN_FADE_OUT_MS);
  }, SAFE_HAVEN_FRAME_SHOW_DELAY_MS);
}

// Wrong answer (real): red reveal, then onWrong after the reveal window.
export function runWrongSequence(deps: GameplayDeps) {
  const { schedule, setRevealState, makeSkippable, onWrong } = deps;
  setRevealState("wrong");
  audioManager.sfx("wrong");
  schedule(makeSkippable(onWrong), WRONG_REVEAL_MS);
}

// Double Dip first miss: mark ONLY the picked answer wrong, return to idle
// with that answer disabled for the second guess.
export function runDoubleDipMiss(deps: GameplayDeps) {
  const { selectedAnswer, disabledAnswers, doubleDipGuessesLeft, schedule, setRevealState, makeSkippable } = deps;
  setRevealState("dip_wrong");
  audioManager.sfx("wrong");
  const finishDip = makeSkippable(() => {
    setRevealState("idle");
    deps.setSelectedAnswer(null);
    deps.setDisabledAnswers(new Set([...disabledAnswers, selectedAnswer]));
    deps.setDoubleDipGuessesLeft(doubleDipGuessesLeft - 1);
  });
  schedule(finishDip, DOUBLE_DIP_FIRST_MISS_MS);
}

// Suspense duration grows with the stakes (1.5s early -> ~3s near the top).
export function suspenseDuration(currentLevel: number, totalQuestions: number): number {
  const progress = totalQuestions > 1 ? (currentLevel - 1) / (totalQuestions - 1) : 0;
  return SUSPENSE_MIN_MS + Math.round(progress * SUSPENSE_MAX_BONUS_MS);
}
