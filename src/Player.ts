export type PlayerType = 'human' | 'computer';

export const PLAYER_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f] as const;

export class Player {
  pairs = 0;

  constructor(
    public readonly index: number,
    public readonly name: string,
    public readonly type: PlayerType,
    public readonly color: number,
  ) {}
}
