// Per-run game records — localStorage-backed, capped at MAX_RECORDS.

import { GameOutcome } from "./prize";

const STORAGE_KEY = "millionaire.history.v1";
const MAX_RECORDS = 100;

export interface GameRecord {
  date: string;             // ISO timestamp
  contestantName: string;
  location: string;
  correctCount: number;
  totalQuestions: number;
  winnings: number;
  outcome: GameOutcome;
  lifelinesUsed: string[];
}

export function loadHistory(): GameRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as GameRecord[];
  } catch (err) {
    console.warn("Failed to load game history:", err);
  }
  return [];
}

export function appendGameRecord(record: GameRecord): void {
  if (typeof window === "undefined") return;
  try {
    const history = loadHistory();
    history.unshift(record); // newest first
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(0, MAX_RECORDS))
    );
  } catch (err) {
    console.error("Failed to save game record:", err);
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export interface HistoryStats {
  totalGames: number;
  bestWinnings: number;
  wins: number;
  avgCorrectRate: number; // 0..1
}

export function computeStats(history: GameRecord[]): HistoryStats {
  if (history.length === 0) {
    return { totalGames: 0, bestWinnings: 0, wins: 0, avgCorrectRate: 0 };
  }
  const totalGames = history.length;
  const bestWinnings = Math.max(...history.map((r) => r.winnings));
  const wins = history.filter((r) => r.outcome === "win").length;
  const avgCorrectRate =
    history.reduce(
      (sum, r) => sum + (r.totalQuestions > 0 ? r.correctCount / r.totalQuestions : 0),
      0
    ) / totalGames;
  return { totalGames, bestWinnings, wins, avgCorrectRate };
}
