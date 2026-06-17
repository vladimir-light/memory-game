export type GridKey = '4x4' | '4x6' | '6x6';

export interface GridSpec {
  rows: number;
  cols: number;
  label: string;
}

export const GRIDS: Record<GridKey, GridSpec> = {
  '4x4': { rows: 4, cols: 4, label: '4 × 4' },
  '4x6': { rows: 4, cols: 6, label: '4 × 6' },
  '6x6': { rows: 6, cols: 6, label: '6 × 6' },
};

/** Turn time limit in seconds when the turn timer is enabled. */
export const TURN_SECONDS = 5;

export interface GameSettings {
  grid: GridKey;
  playerCount: number;
  /** When true, each turn is limited to TURN_SECONDS; timeout passes the turn. */
  turnTimer: boolean;
}

const STORAGE_KEY = 'memory-phaser-settings';

const DEFAULTS: GameSettings = {
  grid: '4x6',
  playerCount: 2,
  turnTimer: false,
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      const grid = parsed.grid && parsed.grid in GRIDS ? parsed.grid : DEFAULTS.grid;
      const playerCount =
        typeof parsed.playerCount === 'number' && parsed.playerCount >= 2 && parsed.playerCount <= 4
          ? parsed.playerCount
          : DEFAULTS.playerCount;
      const turnTimer =
        typeof parsed.turnTimer === 'boolean' ? parsed.turnTimer : DEFAULTS.turnTimer;
      return { grid, playerCount, turnTimer };
    }
  } catch {
    // ignore corrupt storage, fall back to defaults
  }
  return { ...DEFAULTS };
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable (e.g. private mode) — settings just won't persist
  }
}
