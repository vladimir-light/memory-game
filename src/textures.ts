import Phaser from 'phaser';

/** Base resolution card textures are generated at; images get scaled to fit the grid. */
export const CARD_TEX_W = 200;
export const CARD_TEX_H = 270;
export const CARD_TEX_RADIUS = 24;

/** How many different noise-front variants are generated (assigned randomly per card). */
export const FRONT_VARIANTS = 6;

export const frontKey = (i: number) => `card-front-${i}`;
export const BACK_KEY = 'card-back';

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeCanvas(scene: Phaser.Scene, key: string): Phaser.Textures.CanvasTexture {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  const tex = scene.textures.createCanvas(key, CARD_TEX_W, CARD_TEX_H);
  if (!tex) {
    throw new Error(`Failed to create canvas texture "${key}"`);
  }
  return tex;
}

/** Card back: one shared linear gradient, same for every card. */
export function createBackTexture(scene: Phaser.Scene, colors: [string, string]): void {
  const tex = makeCanvas(scene, BACK_KEY);
  const ctx = tex.getContext();
  const w = CARD_TEX_W;
  const h = CARD_TEX_H;

  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, CARD_TEX_RADIUS);
  ctx.clip();

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // subtle diagonal sheen so the back doesn't look flat
  const sheen = ctx.createLinearGradient(0, h, w, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.14)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  roundedRectPath(ctx, 2, 2, w - 4, h - 4, CARD_TEX_RADIUS - 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 4;
  ctx.stroke();

  tex.refresh();
}

/** Card front: light pastel gradient + random noise speckles. */
export function createFrontTexture(scene: Phaser.Scene, key: string): void {
  const tex = makeCanvas(scene, key);
  const ctx = tex.getContext();
  const w = CARD_TEX_W;
  const h = CARD_TEX_H;

  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, CARD_TEX_RADIUS);
  ctx.clip();

  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 50 + Math.floor(Math.random() * 120)) % 360;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, `hsl(${hue1}, 55%, 84%)`);
  grad.addColorStop(1, `hsl(${hue2}, 55%, 76%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // noise speckles
  for (let i = 0; i < 1100; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = 1 + Math.random() * 2.5;
    const dark = Math.random() < 0.5;
    const alpha = 0.04 + Math.random() * 0.08;
    ctx.fillStyle = dark ? `rgba(40, 40, 60, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();

  roundedRectPath(ctx, 2, 2, w - 4, h - 4, CARD_TEX_RADIUS - 2);
  ctx.strokeStyle = 'rgba(40, 40, 70, 0.35)';
  ctx.lineWidth = 4;
  ctx.stroke();

  tex.refresh();
}
