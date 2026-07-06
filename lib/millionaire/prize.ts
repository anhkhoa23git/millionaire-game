// Prize ladder generation — adapts to any number of questions.
// Amounts double from BASE_AMOUNT and are rounded to "nice" values.
// Safe havens sit at ~1/3, ~2/3 of the run, plus the final question.

export interface PrizeStep {
  level: number;      // 1-based question number
  amount: number;
  safe: boolean;
}

const BASE_AMOUNT = 200;

// Round to a display-friendly value (1/2/2.5/5 × 10^k)
function roundNice(value: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  let nice: number;
  if (normalized < 1.5) nice = 1;
  else if (normalized < 2.25) nice = 2;
  else if (normalized < 3.75) nice = 2.5;
  else if (normalized < 7.5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

export function safeHavenLevels(totalQuestions: number): Set<number> {
  if (totalQuestions <= 1) return new Set([totalQuestions]);
  const havens = new Set<number>();
  const first = Math.round(totalQuestions / 3);
  const second = Math.round((2 * totalQuestions) / 3);
  if (first >= 1 && first < totalQuestions) havens.add(first);
  if (second > first && second < totalQuestions) havens.add(second);
  havens.add(totalQuestions);
  return havens;
}

export function buildPrizeLadder(totalQuestions: number): PrizeStep[] {
  const havens = safeHavenLevels(totalQuestions);
  const ladder: PrizeStep[] = [];
  let amount = BASE_AMOUNT;
  for (let level = 1; level <= totalQuestions; level++) {
    ladder.push({ level, amount, safe: havens.has(level) });
    amount = roundNice(amount * 2);
  }
  return ladder;
}

export type GameOutcome = "win" | "wrong" | "walk_away" | "timeout";

// Single source of truth for winnings.
// correctCount = number of questions answered correctly (0..n).
export function computeWinnings(
  correctCount: number,
  outcome: GameOutcome,
  ladder: PrizeStep[]
): number {
  if (correctCount <= 0) return 0;
  const clamped = Math.min(correctCount, ladder.length);

  if (outcome === "win" || outcome === "walk_away") {
    // Keep the amount of the last correctly answered question
    return ladder[clamped - 1].amount;
  }

  // wrong / timeout: fall back to the last safe haven at or below correctCount
  for (let i = clamped - 1; i >= 0; i--) {
    if (ladder[i].safe) return ladder[i].amount;
  }
  return 0;
}
