import type { PlayerType } from './Player';
import { DEFAULT_SYMBOL_SET, SYMBOL_SETS, type SymbolSetKey } from './symbols';

export type GridKey = '4x4' | '4x6' | '6x6';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

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
  /** Type per player slot (always 4 entries; only the first playerCount are used). */
  playerTypes: PlayerType[];
  /** Memory strength of all computer opponents. */
  aiDifficulty: AiDifficulty;
  /** Which emoji pool the cards are drawn from. */
  symbolSet: SymbolSetKey;
}

const STORAGE_KEY = 'memory-phaser-settings';

const DEFAULTS: GameSettings = {
  grid: '4x6',
  playerCount: 2,
  turnTimer: false,
  playerTypes: ['human', 'human', 'human', 'human'],
  aiDifficulty: 'medium',
  symbolSet: DEFAULT_SYMBOL_SET,
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
      const playerTypes: PlayerType[] = Array.from({ length: 4 }, (_, i) => {
        const t = Array.isArray(parsed.playerTypes) ? parsed.playerTypes[i] : undefined;
        return t === 'computer' ? 'computer' : 'human';
      });
      const aiDifficulty: AiDifficulty =
        parsed.aiDifficulty === 'easy' ||
        parsed.aiDifficulty === 'medium' ||
        parsed.aiDifficulty === 'hard'
          ? parsed.aiDifficulty
          : DEFAULTS.aiDifficulty;
      const symbolSet: SymbolSetKey =
        parsed.symbolSet && parsed.symbolSet in SYMBOL_SETS
          ? parsed.symbolSet
          : DEFAULTS.symbolSet;
      return { grid, playerCount, turnTimer, playerTypes, aiDifficulty, symbolSet };
    }
  } catch {
    // ignore corrupt storage, fall back to defaults
  }
  return { ...DEFAULTS, playerTypes: [...DEFAULTS.playerTypes] };
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable (e.g. private mode) — settings just won't persist
  }
}
