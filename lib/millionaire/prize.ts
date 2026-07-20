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

// Sorted safe-haven levels for a given total (ascending).
export function sortedSafeHavens(totalQuestions: number): number[] {
  return [...safeHavenLevels(totalQuestions)].sort((a, b) => a - b);
}

// First safe-haven level — where the moc3 intro audio sting plays.
export function firstSafeHavenLevel(totalQuestions: number): number {
  const havens = sortedSafeHavens(totalQuestions);
  return havens[0] ?? totalQuestions;
}

// Second safe-haven level — where the middle-video sequence plays.
// Falls back to the final question if there is no second haven.
export function middleVideoLevel(totalQuestions: number): number {
  const havens = sortedSafeHavens(totalQuestions);
  return havens[1] ?? havens[havens.length - 1] ?? totalQuestions;
}

// Auto ladder: start at BASE_AMOUNT and double up with nice rounding.
function amountsFromBase(totalQuestions: number): number[] {
  const amounts: number[] = [];
  let amount = BASE_AMOUNT;
  for (let level = 1; level <= totalQuestions; level++) {
    amounts.push(amount);
    amount = roundNice(amount * 2);
  }
  return amounts;
}

// Pinned-top ladder: the final question is EXACTLY topPrize, each earlier
// question is half of the next, nicely rounded (real game-show feel:
// 1,000,000 → 500,000 → 250,000 → …). Guards keep the sequence strictly
// increasing even if topPrize is so small the bottom rungs would collide.
function amountsFromTop(totalQuestions: number, topPrize: number): number[] {
  const amounts = new Array<number>(totalQuestions);
  amounts[totalQuestions - 1] = Math.max(1, Math.floor(topPrize));
  for (let i = totalQuestions - 2; i >= 0; i--) {
    const next = amounts[i + 1];
    let value = Math.floor(roundNice(next / 2)); // integer money, no 2.5 etc.
    if (value >= next) value = next - 1;         // guarantee strictly increasing
    amounts[i] = Math.max(1, value);
  }
  return amounts;
}

export function buildPrizeLadder(totalQuestions: number, topPrize = 0): PrizeStep[] {
  const havens = safeHavenLevels(totalQuestions);
  const amounts =
    topPrize > 0
      ? amountsFromTop(totalQuestions, topPrize)
      : amountsFromBase(totalQuestions);
  return amounts.map((amount, i) => ({
    level: i + 1,
    amount,
    safe: havens.has(i + 1),
  }));
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
