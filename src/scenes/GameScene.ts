import Phaser from 'phaser';
import { Card, CARD_CLICKED } from '../Card';
import { Player, PLAYER_COLORS } from '../Player';
import { BACK_GRADIENTS } from '../gradients';
import { SYMBOLS } from '../symbols';
import { GRIDS, loadSettings } from '../settings';
import { Button } from '../ui';
import { CARD_TEX_H, CARD_TEX_W, createBackTexture, frontKey, FRONT_VARIANTS } from '../textures';

type Phase = 'memorize' | 'turn-idle' | 'turn-pick' | 'resolving' | 'gameover';

const MEMORIZE_SECONDS = 5;
const MISMATCH_SHOW_MS = 900;
const CARD_ASPECT = CARD_TEX_W / CARD_TEX_H;

const HUD_TOP = 16;
const PANEL_H = 64;
const MSG_Y = HUD_TOP + PANEL_H + 26;
const BOARD_TOP = MSG_Y + 30;

interface PlayerPanel {
  bg: Phaser.GameObjects.Rectangle;
  score: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private players: Player[] = [];
  private panels: PlayerPanel[] = [];
  private cards: Card[] = [];
  private activeIdx = 0;
  private firstPick: Card | null = null;
  private phase: Phase = 'memorize';
  private msgText!: Phaser.GameObjects.Text;
  private skipBtn!: Button;

  constructor() {
    super('Game');
  }

  create(): void {
    this.players = [];
    this.panels = [];
    this.cards = [];
    this.firstPick = null;
    this.phase = 'memorize';

    const settings = loadSettings();

    // one random back gradient per game
    const gradient = Phaser.Utils.Array.GetRandom([...BACK_GRADIENTS]);
    createBackTexture(this, gradient);

    for (let i = 0; i < settings.playerCount; i++) {
      // all human for now; PlayerType 'computer' is the hook for future AI opponents
      this.players.push(new Player(i, `Player ${i + 1}`, 'human', PLAYER_COLORS[i]));
    }

    this.createBoard(GRIDS[settings.grid].rows, GRIDS[settings.grid].cols);
    this.createHud();
    this.startMemorizePhase();
  }

  // ── setup ────────────────────────────────────────────────────────────

  private createBoard(rows: number, cols: number): void {
    const { width, height } = this.scale;
    const gap = 12;
    const margin = 30;
    const availW = width - margin * 2;
    const availH = height - BOARD_TOP - margin;

    const cardH = Math.min(
      (availH - gap * (rows - 1)) / rows,
      (availW - gap * (cols - 1)) / cols / CARD_ASPECT,
    );
    const cardW = cardH * CARD_ASPECT;

    const boardW = cols * cardW + (cols - 1) * gap;
    const boardH = rows * cardH + (rows - 1) * gap;
    const startX = (width - boardW) / 2 + cardW / 2;
    const startY = BOARD_TOP + (availH - boardH) / 2 + cardH / 2;

    const pairCount = (rows * cols) / 2;
    const symbols = Phaser.Utils.Array.Shuffle([...SYMBOLS]).slice(0, pairCount);
    const deck = Phaser.Utils.Array.Shuffle([...symbols, ...symbols]);

    deck.forEach((symbol, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const card = new Card(
        this,
        startX + col * (cardW + gap),
        startY + row * (cardH + gap),
        cardW,
        cardH,
        symbol,
        frontKey(Phaser.Math.Between(0, FRONT_VARIANTS - 1)),
      );
      card.on(CARD_CLICKED, () => this.onCardClicked(card));
      this.cards.push(card);
    });
  }

  private createHud(): void {
    const { width } = this.scale;
    const panelW = 170;
    const gap = 16;
    const totalW = this.players.length * panelW + (this.players.length - 1) * gap;
    const startX = (width - totalW) / 2 + panelW / 2;

    this.players.forEach((player, i) => {
      const x = startX + i * (panelW + gap);
      const y = HUD_TOP + PANEL_H / 2;
      const bg = this.add.rectangle(x, y, panelW, PANEL_H, 0x23233c).setStrokeStyle(2, 0x44446a);
      this.add
        .text(x, y - 14, player.name, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: `#${player.color.toString(16).padStart(6, '0')}`,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const score = this.add
        .text(x, y + 14, 'Pairs: 0', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.panels.push({ bg, score });
    });

    this.msgText = this.add
      .text(width / 2, MSG_Y, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.skipBtn = new Button(
      this,
      width - 100,
      HUD_TOP + PANEL_H / 2,
      'Skip turn',
      () => this.onSkip(),
      { width: 150, height: 48, fontSize: 20 },
    ).setEnabled(false) as Button;

    new Button(this, 100, HUD_TOP + PANEL_H / 2, 'Menu', () => this.scene.start('MainMenu'), {
      width: 150,
      height: 48,
      fontSize: 20,
    });
  }

  // ── memorize phase ───────────────────────────────────────────────────

  private startMemorizePhase(): void {
    let remaining = MEMORIZE_SECONDS;
    this.msgText.setText(`Memorize the cards! ${remaining}`);
    this.time.addEvent({
      delay: 1000,
      repeat: MEMORIZE_SECONDS - 1,
      callback: () => {
        remaining--;
        if (remaining > 0) {
          this.msgText.setText(`Memorize the cards! ${remaining}`);
        } else {
          this.flipAllDownAndBegin();
        }
      },
    });
  }

  private flipAllDownAndBegin(): void {
    this.msgText.setText('');
    this.cards.forEach((card, i) => {
      this.time.delayedCall(i * 25, () => void card.flip(false));
    });
    this.time.delayedCall(this.cards.length * 25 + 400, () => {
      this.activeIdx = Phaser.Math.Between(0, this.players.length - 1);
      this.startTurn();
    });
  }

  // ── turn flow ────────────────────────────────────────────────────────

  private get activePlayer(): Player {
    return this.players[this.activeIdx];
  }

  private startTurn(): void {
    this.phase = 'turn-idle';
    this.firstPick = null;
    this.skipBtn.setEnabled(true);
    this.updateHud();
    this.msgText.setText(`${this.activePlayer.name}: pick a card or skip your turn`);

    if (this.activePlayer.type === 'computer') {
      // TODO: future AI opponents hook in here — drive the turn through the
      // same entry points a human uses: onCardClicked(card) / onSkip().
    }
  }

  private onSkip(): void {
    if (this.phase !== 'turn-idle') {
      return;
    }
    this.nextPlayer();
  }

  private onCardClicked(card: Card): void {
    if (this.phase !== 'turn-idle' && this.phase !== 'turn-pick') {
      return;
    }
    if (card.matched || card.isFaceUp || card.isFlipping) {
      return;
    }

    if (this.phase === 'turn-idle') {
      // option 1: start picking — skipping is no longer allowed this turn
      this.phase = 'turn-pick';
      this.skipBtn.setEnabled(false);
      this.firstPick = card;
      void card.flip(true);
      return;
    }

    // second pick
    this.phase = 'resolving';
    void card.flip(true).then(() => this.resolvePicks(this.firstPick!, card));
  }

  private resolvePicks(first: Card, second: Card): void {
    if (first.symbol === second.symbol) {
      this.activePlayer.pairs++;
      first.setMatched(this.activePlayer.color);
      second.setMatched(this.activePlayer.color);
      this.updateHud();

      if (this.cards.every((c) => c.matched)) {
        this.endGame();
      } else {
        this.msgText.setText(`${this.activePlayer.name} found a pair — go again!`);
        this.phase = 'turn-idle';
        this.firstPick = null;
        this.skipBtn.setEnabled(true);
      }
    } else {
      this.msgText.setText('No match!');
      this.time.delayedCall(MISMATCH_SHOW_MS, () => {
        void Promise.all([first.flip(false), second.flip(false)]).then(() => this.nextPlayer());
      });
    }
  }

  private nextPlayer(): void {
    this.activeIdx = (this.activeIdx + 1) % this.players.length;
    this.startTurn();
  }

  private updateHud(): void {
    this.panels.forEach((panel, i) => {
      panel.score.setText(`Pairs: ${this.players[i].pairs}`);
      if (i === this.activeIdx && this.phase !== 'gameover') {
        panel.bg.setStrokeStyle(3, this.players[i].color);
        panel.bg.setFillStyle(0x32325a);
      } else {
        panel.bg.setStrokeStyle(2, 0x44446a);
        panel.bg.setFillStyle(0x23233c);
      }
    });
  }

  // ── game over ────────────────────────────────────────────────────────

  private endGame(): void {
    this.phase = 'gameover';
    this.skipBtn.setEnabled(false);
    this.updateHud();
    this.msgText.setText('');

    const { width, height } = this.scale;
    const best = Math.max(...this.players.map((p) => p.pairs));
    const winners = this.players.filter((p) => p.pairs === best);
    const title =
      winners.length === 1 ? `${winners[0].name} wins!` : `Draw: ${winners.map((w) => w.name).join(' & ')}`;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);

    const panel = this.add.rectangle(width / 2, height / 2, 460, 340, 0x23233c, 1);
    panel.setStrokeStyle(3, 0x8888cc);

    this.add
      .text(width / 2, height / 2 - 110, title, {
        fontFamily: 'Georgia, serif',
        fontSize: '36px',
        color: '#f6d365',
      })
      .setOrigin(0.5);

    const ranking = [...this.players].sort((a, b) => b.pairs - a.pairs);
    this.add
      .text(
        width / 2,
        height / 2 - 20,
        ranking.map((p) => `${p.name}: ${p.pairs} pairs`).join('\n'),
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '22px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    new Button(this, width / 2, height / 2 + 70, 'Play Again', () => this.scene.restart(), {
      width: 220,
      height: 50,
    });
    new Button(this, width / 2, height / 2 + 132, 'Main Menu', () => this.scene.start('MainMenu'), {
      width: 220,
      height: 50,
    });
  }
}
