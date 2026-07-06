// Game settings — localStorage-backed.

const STORAGE_KEY = "millionaire.settings.v1";

export interface GameSettings {
  timerEnabled: boolean;
  // Base seconds for the easiest tier; harder tiers get more time
  timerBaseSeconds: number;
  sfxVolume: number;   // 0..1
  musicVolume: number; // 0..1
}

export const DEFAULT_SETTINGS: GameSettings = {
  timerEnabled: true,
  timerBaseSeconds: 30,
  sfxVolume: 0.7,
  musicVolume: 0.6,
};

export function loadSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// Time limit per question: 30s for first third, 45s middle, 60s final third
// (scaled off timerBaseSeconds so Settings can adjust overall pace).
export function timeLimitForLevel(
  level: number,
  totalQuestions: number,
  settings: GameSettings
): number {
  const base = settings.timerBaseSeconds;
  const third = totalQuestions / 3;
  if (level <= Math.ceil(third)) return base;
  if (level <= Math.ceil(2 * third)) return Math.round(base * 1.5);
  return base * 2;
}
