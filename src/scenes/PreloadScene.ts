import Phaser from 'phaser';
import { createFrontTexture, frontKey, FRONT_VARIANTS } from '../textures';

/**
 * No external assets yet — this scene generates the procedural card-front
 * textures and is the place to put real asset loading later.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const { width, height } = this.scale;
    const barW = 320;
    const barH = 24;

    this.add
      .text(width / 2, height / 2 - 40, 'Loading…', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const barBg = this.add.rectangle(width / 2, height / 2 + 20, barW, barH, 0x2d2d4e);
    barBg.setStrokeStyle(2, 0x8888cc);
    const bar = this.add
      .rectangle(width / 2 - barW / 2 + 2, height / 2 + 20, 0, barH - 6, 0x44cc88)
      .setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = (barW - 4) * value;
    });

    // future: this.load.image(...), this.load.audio(...), etc.
  }

  create(): void {
    for (let i = 0; i < FRONT_VARIANTS; i++) {
      createFrontTexture(this, frontKey(i));
    }
    this.scene.start('MainMenu');
  }
}
