import Phaser from 'phaser';
import { Button } from '../ui';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height * 0.22, 'MEMORY', {
        fontFamily: 'Georgia, serif',
        fontSize: '88px',
        color: '#f6d365',
        stroke: '#8e2de2',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    new Button(this, width / 2, height * 0.45, 'New Game', () => {
      this.scene.start('Game');
    });

    new Button(this, width / 2, height * 0.45 + 80, 'Settings', () => {
      this.scene.start('Settings');
    });

    const exitMsg = this.add
      .text(width / 2, height * 0.45 + 230, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#aaaacc',
      })
      .setOrigin(0.5);

    new Button(this, width / 2, height * 0.45 + 160, 'Exit', () => {
      window.close();
      // browsers usually block window.close() for tabs they didn't open
      exitMsg.setText('You can close this browser tab now.');
    });
  }
}
