import Phaser from 'phaser';

export interface ButtonOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  fillColor?: number;
  hoverColor?: number;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private btnWidth: number;
  private btnHeight: number;
  private fillColor: number;
  private hoverColor: number;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    opts: ButtonOptions = {},
  ) {
    super(scene, x, y);
    this.btnWidth = opts.width ?? 260;
    this.btnHeight = opts.height ?? 56;
    this.fillColor = opts.fillColor ?? 0x2d2d4e;
    this.hoverColor = opts.hoverColor ?? 0x44447a;

    this.bg = scene.add.graphics();
    this.drawBg(this.fillColor);

    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${opts.fontSize ?? 24}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(this.btnWidth, this.btnHeight);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', () => this.enabled && this.drawBg(this.hoverColor));
    this.on('pointerout', () => this.drawBg(this.fillColor));
    this.on('pointerup', () => this.enabled && onClick());

    scene.add.existing(this);
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.4);
    if (enabled) {
      this.setInteractive({ useHandCursor: true });
    } else {
      this.disableInteractive();
      this.drawBg(this.fillColor);
    }
    return this;
  }

  setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  setFill(color: number): this {
    this.fillColor = color;
    this.drawBg(color);
    return this;
  }

  private drawBg(color: number): void {
    this.bg.clear();
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-this.btnWidth / 2, -this.btnHeight / 2, this.btnWidth, this.btnHeight, 12);
    this.bg.lineStyle(2, 0x8888cc, 0.8);
    this.bg.strokeRoundedRect(-this.btnWidth / 2, -this.btnHeight / 2, this.btnWidth, this.btnHeight, 12);
  }
}
