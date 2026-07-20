// Central tuning for the gameplay screen.
// All "magic numbers" from GameplayScreen live here so a designer can adjust
// pacing, level specials, and reveal timing in ONE place instead of hunting
// through 800 lines of timeout chains.

// ---------------------------------------------------------------------------
// Question count bounds (player-selectable total)
// ---------------------------------------------------------------------------

/** Minimum number of questions a game can have. */
export const MIN_QUESTIONS = 3;
/** Maximum number of questions a game can have. */
export const MAX_QUESTIONS = 15;

// NOTE: The moc3 audio level and the middle-video level are NOT fixed
// constants anymore — they depend on the total question count. Compute them
// with `firstSafeHavenLevel(total)` and `middleVideoLevel(total)` from
// lib/millionaire/prize.ts so the sequence adapts to any length (e.g. 15
// questions -> safe havens at 5/10/15, middle video at 10, moc3 at 5).

// ---------------------------------------------------------------------------
// Reveal / suspense timing (ms)
// ---------------------------------------------------------------------------

/** How long the green "CORRECT" reveal text stays before clearing. */
export const REVEAL_TEXT_HIDE_MS = 2000;
/** Minimum suspense drum-roll early in the game (scales up with stakes). */
export const SUSPENSE_MIN_MS = 1500;
/** Extra suspense added near the top of the ladder. */
export const SUSPENSE_MAX_BONUS_MS = 1500;

// ---------------------------------------------------------------------------
// Safe-haven sequence timing (ms)
// ---------------------------------------------------------------------------

/** Fade the gameplay content out before the safe-haven frame appears. */
export const SAFE_HAVEN_FADE_OUT_MS = 1000;
/** Delay before the safe-haven frame appears after the fade. */
export const SAFE_HAVEN_FRAME_SHOW_DELAY_MS = 2500;
/** How long the safe-haven frame stays on screen (non-moc3 levels). */
export const SAFE_HAVEN_FRAME_VISIBLE_MS = 5000;
/** How long the safe-haven frame stays on screen for ordinary correct answers. */
export const SAFE_HAVEN_FRAME_ORDINARY_MS = 3000;
/** Level-3 only: wait for moc3 to finish before showing the money ladder. */
export const MOC3_MONEY_LADDER_DELAY_MS = 6000;
/** How long the wrong/timeout reveal lingers before ending the question. */
export const WRONG_REVEAL_MS = 3000;
/** How long the Double-Dip first-miss mark lingers before returning to idle. */
export const DOUBLE_DIP_FIRST_MISS_MS = 1500;
/** Lifeline conflict notice auto-dismiss. */
export const LIFELINE_NOTICE_MS = 2500;

// ---------------------------------------------------------------------------
// Audience poll / 50:50
// ---------------------------------------------------------------------------

export const ANSWER_INDICES = [0, 1, 2, 3] as const;
