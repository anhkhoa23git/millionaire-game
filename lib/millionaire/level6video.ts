// Level-6 video sequence handlers, extracted from GameplayScreen so the
// middle-video -> intro -> money-ladder -> darkness-video flow lives in one
// audited, testable place. All functions are plain (no React) and receive a
// Level6Deps object with the setters / callbacks they need.

import { middleVideoLevel } from "./prize";

export interface Level6Deps {
  currentLevel: number;
  totalQuestions: number;
  doubleDipActive: boolean;
  // setters
  setShowSafeHavenMoneyLadder: (v: boolean) => void;
  setFadeOutContent: (v: boolean) => void;
  setShowMiddleVideo: (v: boolean) => void;
  setShowMiddleIntro: (v: boolean) => void;
  setShowDarknessVideo: (v: boolean) => void;
  setLevel6SafeHavenLevel: (n: number) => void;
  setDoubleDipActive: (v: boolean) => void;
  setDoubleDipGuessesLeft: (n: number) => void;
  // callback
  onCorrect: (newLevel: number) => void;
}

function clearDoubleDip(deps: Level6Deps) {
  if (deps.doubleDipActive) {
    deps.setDoubleDipActive(false);
    deps.setDoubleDipGuessesLeft(0);
  }
}

// Continue button on the Safe Haven Money Ladder overlay.
// On level 6, this kicks off the darkness video instead of advancing.
export function continueFromMoneyLadder(deps: Level6Deps) {
  deps.setShowSafeHavenMoneyLadder(false);
  deps.setFadeOutContent(false);
  clearDoubleDip(deps);

  if (deps.currentLevel === middleVideoLevel(deps.totalQuestions)) {
    deps.setShowDarknessVideo(true);
  } else {
    deps.onCorrect(deps.currentLevel + 1);
  }
}

// Middle video finished -> show the intro card.
export function onMiddleVideoEnd(deps: Level6Deps) {
  deps.setShowMiddleVideo(false);
  deps.setShowMiddleIntro(true);
}

// Intro card clicked -> show the money ladder (level 6 safe haven).
export function onMiddleIntroClick(deps: Level6Deps) {
  deps.setShowMiddleIntro(false);
  deps.setShowSafeHavenMoneyLadder(true);
  deps.setLevel6SafeHavenLevel(6);
}

// Darkness video finished -> advance to the next level.
export function onDarknessVideoEnd(deps: Level6Deps) {
  deps.setShowDarknessVideo(false);
  clearDoubleDip(deps);
  deps.onCorrect(deps.currentLevel + 1);
}
