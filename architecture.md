# Architecture — millionaire-game-new

Game show "Ai là triệu phú" (Vietnam culture & history edition), Next.js + React + TypeScript.

## Entry point
- `app/page.tsx` — thin render. Owns the top-level page state machine via
  `useGameFlow()` (see `lib/millionaire/gameFlow.ts`) and renders the active
  screen. No gameplay logic lives here.
- `app/globals.css` — shared styles (moved out of inline styles during cleanup).

## Gameplay logic (the sensitive part) lives in `lib/millionaire/`
All timeout-driven / state-machine gameplay code was extracted out of
`GameplayScreen.tsx` into small, **plain, testable** modules. The component is
now a thin JSX + wiring layer that delegates to these.

| Module | Responsibility |
|--------|----------------|
| `gameTuning.ts` | All magic numbers & timings: `MOC3_SAFE_HAVEN_LEVEL=3`, `MIDDLE_VIDEO_LEVEL=6`, `ANSWER_INDICES`, suspense/reveal/safe-haven durations. **Edit gameplay feel here, not in components.** |
| `answerStateUtil.ts` | Pure `getAnswerState(idx, input)` → answer box visual state. |
| `revealphases.ts` | Answer-reveal state machine: `runCorrectSequence` / `runSafeHavenFrame` / `runOrdinaryFrame` / `runWrongSequence` / `runDoubleDipMiss` / `suspenseDuration`. Receives a `GameplayDeps` object (setters + callbacks). |
| `level6video.ts` | Level-6 video chain: `continueFromMoneyLadder` / `onMiddleVideoEnd` / `onMiddleIntroClick` / `onDarknessVideoEnd`. Receives a `Level6Deps` object. |
| `lifelines.ts` | Lifeline data + pure helpers: `computeFiftyFiftyDisabled(rng?)` (injectable RNG for tests), `isBlockedLifelineCombo`, `simulateAudiencePoll`. |
| `gameFlow.ts` | Page-level state machine (`useGameFlow` hook). |
| `prize.ts` | `buildPrizeLadder` + `safeHavenLevels(total)`. **Level 6 is a safe haven only when `totalQuestions` makes it one** (see note below). |
| `audio.ts`, `settings.ts`, `questions.ts`, `state.ts`, `skip.ts` | Support utilities. |

### Component layer
- `components/millionaire/GameplayScreen.tsx` — renders the question/answers/
  overlays and exposes thin `useCallback` handlers that **build a deps object**
  and call the `lib/millionaire/*` functions. Keep it that way: put new gameplay
  logic in `lib`, not here.
- Other screens (`WelcomeScreen`, `MenuScreen`, `ContestantIntroScreen`,
  `IntroductionScreen`, `MiddleVideoScreen`, `DarknessVideoScreen`,
  `SafeHavenFrame`, `SafeHavenMoneyLadder`, `EndScreen`, …) are presentational.

## Key gameplay facts (verified)
- The question bank has **9 questions** (`DEFAULT_QUESTIONS.length`).
  `safeHavenLevels(9) = {3, 6, 9}` → **level 6 is a safe haven**, so the
  middle-video sequence correctly triggers. (This was suspected to be a bug
  during review; it is correct behavior.)
- Suspense duration grows with the level (≈1.5s early → ≈3s near the top).
- Double Dip: first wrong guess marks ONLY that answer red (`dip_wrong`),
  returns to idle with it disabled, and leaves 1 guess.
- `lib/millionaire/skip.ts` (`setSkipHandler`) lets the user fast-forward
  reveal segments; `makeSkippable` wraps a continuation so it runs exactly once.

## Tests
- Framework: **vitest** + **@testing-library/react** + **jsdom**.
- Config: `vitest.config.ts` (jsdom env, `@/` → project root, setup file),
  `vitest.setup.ts` (stubs `HTMLMediaElement` playback for jsdom).
- Run: `npm test` (aka `vitest run`); `npm run test:watch` for watch mode.
- Coverage: 26 tests — unit tests for pure helpers (`answerStateUtil`,
  `revealphases`, `level6video`, `lifelines`) + integration tests for
  `GameplayScreen` (render, correct→onCorrect, level-6→middle video, wrong→onWrong).
- Timeout chains are tested with `vi.useFakeTimers()` + `vi.advanceTimersByTime(...)`.
  In tests, `makeSkippable` is mocked to run its `finish` immediately so the
  scheduled callback fires on timer advance.

## Conventions (IMPORTANT on Windows)
- **Filenames are case-insensitive on Windows.** Two files that differ only by
  case (e.g. `gamePhases.ts` vs `gamephases.ts`) cause `TS1149` and break both
  `tsc` and `next build`. **Use all-lowercase or clearly distinct names**
  (current modules use `revealphases.ts`, `level6video.ts`, `answerStateUtil.ts`).
- Never auto-merge to `master`. Work on a feature branch, open a PR, and let the
  repo owner review/merge.

## Before changing gameplay logic
1. Add/extend a unit test in the relevant `lib/millionaire/*.test.ts`.
2. Implement in the `lib` module (not in the component).
3. Verify: `npx tsc --noEmit`, `npm run build`, `npm test` all pass.
4. Open a PR.
