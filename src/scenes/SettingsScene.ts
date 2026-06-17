import Phaser from 'phaser';
import { Button } from '../ui';
import {
  GRIDS,
  loadSettings,
  saveSettings,
  TURN_SECONDS,
  type GameSettings,
  type GridKey,
} from '../settings';

const SELECTED_COLOR = 0x2e8b57;
const UNSELECTED_COLOR = 0x2d2d4e;

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;

  constructor() {
    super('Settings');
  }

  create(): void {
    this.settings = loadSettings();
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height * 0.11, 'Settings', {
        fontFamily: 'Georgia, serif',
        fontSize: '56px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.addLabel(width / 2, height * 0.24, 'Grid size');
    const gridKeys = Object.keys(GRIDS) as GridKey[];
    this.addOptionRow(
      height * 0.31,
      gridKeys.map((key) => GRIDS[key].label),
      gridKeys.indexOf(this.settings.grid),
      (i) => {
        this.settings.grid = gridKeys[i];
        this.applyAndRefresh();
      },
    );

    this.addLabel(width / 2, height * 0.43, 'Players');
    const counts = [2, 3, 4];
    this.addOptionRow(
      height * 0.5,
      counts.map(String),
      counts.indexOf(this.settings.playerCount),
      (i) => {
        this.settings.playerCount = counts[i];
        this.applyAndRefresh();
      },
    );

    this.addLabel(width / 2, height * 0.62, 'Turn time limit');
    this.addOptionRow(
      height * 0.69,
      ['Off', `On (${TURN_SECONDS}s)`],
      this.settings.turnTimer ? 1 : 0,
      (i) => {
        this.settings.turnTimer = i === 1;
        this.applyAndRefresh();
      },
    );

    new Button(this, width / 2, height * 0.85, 'Back', () => {
      this.scene.start('MainMenu');
    });
  }

  private addLabel(x: number, y: number, text: string): void {
    this.add
      .text(x, y, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#aaaacc',
      })
      .setOrigin(0.5);
  }

  private addOptionRow(
    y: number,
    labels: string[],
    selectedIndex: number,
    onSelect: (index: number) => void,
  ): void {
    const btnW = 140;
    const gap = 24;
    const totalW = labels.length * btnW + (labels.length - 1) * gap;
    const startX = this.scale.width / 2 - totalW / 2 + btnW / 2;

    labels.forEach((label, i) => {
      const btn = new Button(this, startX + i * (btnW + gap), y, label, () => onSelect(i), {
        width: btnW,
        height: 52,
      });
      if (i === selectedIndex) {
        btn.setFill(SELECTED_COLOR);
      } else {
        btn.setFill(UNSELECTED_COLOR);
      }
    });
  }

  private applyAndRefresh(): void {
    saveSettings(this.settings);
    this.scene.restart();
  }
}
