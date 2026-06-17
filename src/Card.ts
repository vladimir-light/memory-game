import Phaser from 'phaser';
import { BACK_KEY, CARD_TEX_RADIUS, CARD_TEX_W } from './textures';

const EMOJI_FONT =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

export const CARD_CLICKED = 'card-clicked';

export class Card extends Phaser.GameObjects.Container {
  readonly symbol: string;
  matched = false;

  private front: Phaser.GameObjects.Image;
  private back: Phaser.GameObjects.Image;
  private symbolText: Phaser.GameObjects.Text;
  private cardW: number;
  private cardH: number;
  private faceUp = true;
  private flipping = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cardW: number,
    cardH: number,
    symbol: string,
    frontTextureKey: string,
  ) {
    super(scene, x, y);
    this.symbol = symbol;
    this.cardW = cardW;
    this.cardH = cardH;

    this.front = scene.add.image(0, 0, frontTextureKey).setDisplaySize(cardW, cardH);
    this.back = scene.add.image(0, 0, BACK_KEY).setDisplaySize(cardW, cardH).setVisible(false);
    this.symbolText = scene.add
      .text(0, 0, symbol, {
        fontFamily: EMOJI_FONT,
        fontSize: `${Math.round(Math.min(cardW * 0.55, cardH * 0.45))}px`,
      })
      .setOrigin(0.5);

    this.add([this.back, this.front, this.symbolText]);
    this.setSize(cardW, cardH);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerup', () => this.emit(CARD_CLICKED, this));

    scene.add.existing(this);
  }

  get isFaceUp(): boolean {
    return this.faceUp;
  }

  get isFlipping(): boolean {
    return this.flipping;
  }

  /** Sets the face instantly, without the flip animation. */
  setFace(faceUp: boolean): void {
    this.faceUp = faceUp;
    this.front.setVisible(faceUp);
    this.symbolText.setVisible(faceUp);
    this.back.setVisible(!faceUp);
  }

  /** Tween-flips the card; resolves when the animation finishes. */
  flip(faceUp: boolean, duration = 130): Promise<void> {
    if (this.faceUp === faceUp || this.flipping) {
      return Promise.resolve();
    }
    this.flipping = true;
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0,
        duration,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.faceUp = faceUp;
          this.front.setVisible(faceUp);
          this.symbolText.setVisible(faceUp);
          this.back.setVisible(!faceUp);
          this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            duration,
            ease: 'Quad.easeOut',
            onComplete: () => {
              this.flipping = false;
              resolve();
            },
          });
        },
      });
    });
  }

  /** Keeps the card face-up but dimmed, framed with the owning player's color. */
  setMatched(ownerColor: number): void {
    this.matched = true;
    this.disableInteractive();
    this.front.setAlpha(0.45);
    this.symbolText.setAlpha(0.65);

    const radius = (CARD_TEX_RADIUS * this.cardW) / CARD_TEX_W;
    const frame = this.scene.add.graphics();
    frame.lineStyle(4, ownerColor, 0.9);
    frame.strokeRoundedRect(
      -this.cardW / 2 + 2,
      -this.cardH / 2 + 2,
      this.cardW - 4,
      this.cardH - 4,
      radius,
    );
    this.add(frame);
  }
}
