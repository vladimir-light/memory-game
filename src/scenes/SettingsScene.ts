import Phaser from 'phaser';
import { Button } from '../ui';
import {
  GRIDS,
  loadSettings,
  saveSettings,
  TURN_SECONDS,
  type AiDifficulty,
  type GameSettings,
  type GridKey,
} from '../settings';

const SELECTED_COLOR = 0x2e8b57;
const UNSELECTED_COLOR = 0x2d2d4e;
const CPU_COLOR = 0x8e44ad;

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;

  constructor() {
    super('Settings');
  }

  create(): void {
    this.settings = loadSettings();
    const { width } = this.scale;

    this.add
      .text(width / 2, 56, 'Settings', {
        fontFamily: 'Georgia, serif',
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.addLabel(120, 'Grid size');
    const gridKeys = Object.keys(GRIDS) as GridKey[];
    this.addOptionRow(
      166,
      gridKeys.map((key) => GRIDS[key].label),
      gridKeys.indexOf(this.settings.grid),
      (i) => {
        this.settings.grid = gridKeys[i];
        this.applyAndRefresh();
      },
    );

    this.addLabel(232, 'Players');
    const counts = [2, 3, 4];
    this.addOptionRow(
      278,
      counts.map(String),
      counts.indexOf(this.settings.playerCount),
      (i) => {
        this.settings.playerCount = counts[i];
        this.applyAndRefresh();
      },
    );

    this.addLabel(344, 'Player types — click to toggle');
    this.addPlayerTypeRow(390);

    this.addLabel(456, 'Computer difficulty');
    const difficulties: AiDifficulty[] = ['easy', 'medium', 'hard'];
    this.addOptionRow(
      502,
      ['Easy', 'Medium', 'Hard'],
      difficulties.indexOf(this.settings.aiDifficulty),
      (i) => {
        this.settings.aiDifficulty = difficulties[i];
        this.applyAndRefresh();
      },
    );

    this.addLabel(568, 'Turn time limit');
    this.addOptionRow(
      614,
      ['Off', `On (${TURN_SECONDS}s)`],
      this.settings.turnTimer ? 1 : 0,
      (i) => {
        this.settings.turnTimer = i === 1;
        this.applyAndRefresh();
      },
    );

    new Button(this, width / 2, 706, 'Back', () => {
      this.scene.start('MainMenu');
    });
  }

  private addLabel(y: number, text: string): void {
    this.add
      .text(this.scale.width / 2, y, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
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
        height: 48,
        fontSize: 22,
      });
      btn.setFill(i === selectedIndex ? SELECTED_COLOR : UNSELECTED_COLOR);
    });
  }

  /** One toggle button per active player slot: Human ⇄ CPU. */
  private addPlayerTypeRow(y: number): void {
    const count = this.settings.playerCount;
    const btnW = 150;
    const gap = 20;
    const totalW = count * btnW + (count - 1) * gap;
    const startX = this.scale.width / 2 - totalW / 2 + btnW / 2;

    for (let i = 0; i < count; i++) {
      const isCpu = this.settings.playerTypes[i] === 'computer';
      const btn = new Button(
        this,
        startX + i * (btnW + gap),
        y,
        `P${i + 1}: ${isCpu ? 'CPU' : 'Human'}`,
        () => {
          this.settings.playerTypes[i] = isCpu ? 'human' : 'computer';
          this.applyAndRefresh();
        },
        { width: btnW, height: 48, fontSize: 20 },
      );
      btn.setFill(isCpu ? CPU_COLOR : UNSELECTED_COLOR);
    }
  }

  private applyAndRefresh(): void {
    saveSettings(this.settings);
    this.scene.restart();
  }
}
