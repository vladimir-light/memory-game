import Phaser from 'phaser';
import type { Card } from './Card';
import type { AiDifficulty } from './settings';

export interface AiProfile {
  /** Chance to commit a card revealed during play to memory. */
  recallChance: number;
  /** Chance per card to memorize it during the initial 5s reveal. */
  memorizeChance: number;
  /** Chance per remembered card to forget it at the start of each own turn. */
  decayChance: number;
}

export const AI_PROFILES: Record<AiDifficulty, AiProfile> = {
  easy: { recallChance: 0.45, memorizeChance: 0.05, decayChance: 0.15 },
  medium: { recallChance: 0.75, memorizeChance: 0.15, decayChance: 0.06 },
  hard: { recallChance: 0.95, memorizeChance: 0.35, decayChance: 0.02 },
};

/**
 * Memory-based computer opponent. It watches every card reveal (its own and
 * other players') with an imperfect, decaying memory, and acts through the
 * same GameScene entry points a human uses.
 */
export class AiController {
  private memory = new Map<Card, string>();

  constructor(private readonly profile: AiProfile) {}

  /** Called whenever any card is revealed face-up. */
  observe(card: Card, duringMemorize = false): void {
    const chance = duringMemorize ? this.profile.memorizeChance : this.profile.recallChance;
    if (Math.random() < chance) {
      this.memory.set(card, card.symbol);
    }
  }

  /** Matched cards leave the game and the memory. */
  forget(card: Card): void {
    this.memory.delete(card);
  }

  /** Called at the start of each own turn — memory fades over time. */
  startTurn(): void {
    for (const card of [...this.memory.keys()]) {
      if (Math.random() < this.profile.decayChance) {
        this.memory.delete(card);
      }
    }
  }

  chooseFirst(facedown: Card[]): Card {
    const pair = this.findKnownPair(facedown);
    if (pair) {
      return pair;
    }
    // nothing certain — flip an unknown card to gain information
    const unknown = facedown.filter((c) => !this.memory.has(c));
    return Phaser.Utils.Array.GetRandom(unknown.length > 0 ? unknown : facedown);
  }

  chooseSecond(first: Card, facedown: Card[]): Card {
    const candidates = facedown.filter((c) => c !== first);
    const match = candidates.find((c) => this.memory.get(c) === first.symbol);
    if (match) {
      return match;
    }
    // no known match — an unknown card at least reveals something new,
    // while a known non-matching card is a guaranteed miss
    const unknown = candidates.filter((c) => !this.memory.has(c));
    return Phaser.Utils.Array.GetRandom(unknown.length > 0 ? unknown : candidates);
  }

  private findKnownPair(facedown: Card[]): Card | null {
    const bySymbol = new Map<string, Card[]>();
    for (const card of facedown) {
      const symbol = this.memory.get(card);
      if (symbol) {
        const list = bySymbol.get(symbol) ?? [];
        list.push(card);
        bySymbol.set(symbol, list);
      }
    }
    for (const cards of bySymbol.values()) {
      if (cards.length >= 2) {
        return cards[0];
      }
    }
    return null;
  }
}
