/**
 * Symbol pools for card faces. Emojis act as the "exotic font" glyphs.
 * Each set needs at least 18 entries (6x6 grid = 18 pairs).
 */

export type SymbolSetKey = 'mixed' | 'animals' | 'emotions' | 'vehicles' | 'food';

export interface SymbolSet {
  label: string;
  symbols: readonly string[];
}

/** Default set: a varied mix across many themes (the classic look). */
const MIXED: readonly string[] = [
  '🦄', '🐙', '🦊', '🐸', '🦋', '🐢', '🦁', '🐼', '🐳', '🦜',
  '🌵', '🍄', '🌸', '🍕', '🍩', '🎈', '🎲', '🎸', '🚀', '🌙',
  '⭐', '🔥', '💎', '🍓', '🥑', '⚽', '🎯', '🧩', '🪐', '🍉',
  '🌈', '🍔', '🐝', '🦖', '🎃', '🎁', '🏀', '🎺', '🛸', '🍦',
  '🌻', '🐬', '🦀', '🍇', '🧸', '🎨', '⚓', '🍿', '😎', '🤖',
];

/** Animals only — visually similar shapes make this harder than the mix. */
const ANIMALS: readonly string[] = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅',
  '🦉', '🐺', '🐗', '🐴', '🐝', '🦋', '🐌', '🐞', '🦄', '🐢',
];

/** Expressive faces — the hardest set, since many faces look alike. */
const EMOTIONS: readonly string[] = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎',
  '🤩', '🥳', '😭', '😡', '😱',
];

/** Vehicles / transport only. */
const VEHICLES: readonly string[] = [
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚚', '🚛', '🚜', '🛵', '🏍️', '🚲', '🛴', '🚂', '🚀', '✈️',
  '🚁', '🚤', '⛵', '🚢',
];

/** Food & drink only. */
const FOOD: readonly string[] = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥚', '🍳', '🥞', '🧇',
  '🧀', '🥗', '🍝', '🍜', '🍣', '🍤', '🍦', '🍩', '🍪', '🎂',
  '🍰', '🍫', '🍓', '🍇',
];

export const SYMBOL_SETS: Record<SymbolSetKey, SymbolSet> = {
  mixed: { label: 'Mixed', symbols: MIXED },
  animals: { label: 'Animals', symbols: ANIMALS },
  emotions: { label: 'Emotions', symbols: EMOTIONS },
  vehicles: { label: 'Vehicles', symbols: VEHICLES },
  food: { label: 'Food', symbols: FOOD },
};

export const DEFAULT_SYMBOL_SET: SymbolSetKey = 'mixed';

/** Back-compat alias for the default symbol pool. */
export const SYMBOLS = MIXED;
