/**
 * Standalone card-front generators for the dev Playground.
 *
 * Deliberately NOT shared with the game's textures.ts — this is a throwaway
 * sandbox. Tune a look here, then port the winning numbers back into the game
 * by hand (or use the "Copy params JSON" button).
 *
 * Phaser ships no noise primitives, so value-noise (Perlin-like) and Voronoi
 * are hand-rolled below. All randomness flows through one seeded
 * RandomDataGenerator so a given seed always reproduces the same texture.
 */
import Phaser from 'phaser';

export type PatternType = 'none' | 'speckle' | 'perlin' | 'voronoi' | 'stripes' | 'checker';

export interface GradientParams {
  type: 'linear' | 'radial';
  /** Linear-gradient direction in degrees (ignored for radial). */
  angle: number;
  hue1: number;
  hue2: number;
  /** Saturation %, applied to both stops. */
  saturation: number;
  /** Lightness % of the first / second stop. */
  lightTop: number;
  lightBottom: number;
}

export interface FrontParams {
  width: number;
  height: number;
  radius: number;
  seed: string;
  border: boolean;
  gradient: GradientParams;
  pattern: PatternType;
  speckle: { count: number; sizeMin: number; sizeMax: number; alpha: number; darkRatio: number };
  perlin: { scale: number; octaves: number; contrast: number; strength: number };
  voronoi: { cells: number; edgeAlpha: number; fillAlpha: number };
  stripes: { width: number; angle: number; alpha: number };
  checker: { size: number; alpha: number };
}

export function defaultFrontParams(): FrontParams {
  return {
    width: 200,
    height: 270,
    radius: 24,
    seed: 'memory',
    border: true,
    gradient: {
      type: 'linear',
      angle: 45,
      hue1: 200,
      hue2: 320,
      saturation: 55,
      lightTop: 84,
      lightBottom: 76,
    },
    pattern: 'perlin',
    speckle: { count: 1100, sizeMin: 1, sizeMax: 3.5, alpha: 0.1, darkRatio: 0.5 },
    perlin: { scale: 36, octaves: 4, contrast: 1.2, strength: 0.22 },
    voronoi: { cells: 28, edgeAlpha: 0.35, fillAlpha: 0.12 },
    stripes: { width: 14, angle: 45, alpha: 0.12 },
    checker: { size: 20, alpha: 0.1 },
  };
}

const clamp255 = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);

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

// ── noise primitives (hand-rolled; Phaser has none) ────────────────────────

/** Seeded 2D value noise with smooth (quintic) interpolation; output ~[-1, 1]. */
function makeValueNoise(rng: Phaser.Math.RandomDataGenerator): (x: number, y: number) => number {
  const SIZE = 256;
  const MASK = 255;
  const perm = new Int32Array(SIZE * 2);
  const vals = new Float32Array(SIZE);
  const p = new Int32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    p[i] = i;
    vals[i] = rng.frac() * 2 - 1;
  }
  for (let i = SIZE - 1; i > 0; i--) {
    const j = rng.between(0, i);
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < SIZE * 2; i++) {
    perm[i] = p[i & MASK];
  }
  const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
  const lat = (xi: number, yi: number): number => vals[perm[(perm[xi & MASK] + yi) & MASK]];
  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const v00 = lat(x0, y0);
    const v10 = lat(x0 + 1, y0);
    const v01 = lat(x0, y0 + 1);
    const v11 = lat(x0 + 1, y0 + 1);
    return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
  };
}

function fbm(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / (norm || 1);
}

// ── per-pattern painters (operate on a rectangular offscreen ctx) ───────────

function drawGradient(ctx: CanvasRenderingContext2D, g: GradientParams, w: number, h: number): void {
  let grad: CanvasGradient;
  if (g.type === 'radial') {
    grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.08, w / 2, h / 2, Math.max(w, h) * 0.75);
  } else {
    const a = (g.angle * Math.PI) / 180;
    const dx = (Math.cos(a) * w) / 2;
    const dy = (Math.sin(a) * h) / 2;
    grad = ctx.createLinearGradient(w / 2 - dx, h / 2 - dy, w / 2 + dx, h / 2 + dy);
  }
  grad.addColorStop(0, `hsl(${g.hue1}, ${g.saturation}%, ${g.lightTop}%)`);
  grad.addColorStop(1, `hsl(${g.hue2}, ${g.saturation}%, ${g.lightBottom}%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawSpeckle(
  ctx: CanvasRenderingContext2D,
  p: FrontParams,
  rng: Phaser.Math.RandomDataGenerator,
  w: number,
  h: number,
): void {
  const c = p.speckle;
  for (let i = 0; i < c.count; i++) {
    const x = rng.frac() * w;
    const y = rng.frac() * h;
    const size = c.sizeMin + rng.frac() * Math.max(0, c.sizeMax - c.sizeMin);
    const dark = rng.frac() < c.darkRatio;
    const alpha = c.alpha * (0.4 + rng.frac() * 0.6);
    ctx.fillStyle = dark ? `rgba(40, 40, 60, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }
}

function drawPerlin(
  ctx: CanvasRenderingContext2D,
  p: FrontParams,
  rng: Phaser.Math.RandomDataGenerator,
  w: number,
  h: number,
): void {
  const noise = makeValueNoise(rng);
  const scale = Math.max(2, p.perlin.scale);
  const octaves = Math.max(1, Math.round(p.perlin.octaves));
  const { contrast, strength } = p.perlin;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = fbm(noise, x / scale, y / scale, octaves);
      n = Math.max(-1, Math.min(1, n * contrast));
      const delta = n * strength * 255;
      const idx = (y * w + x) * 4;
      data[idx] = clamp255(data[idx] + delta);
      data[idx + 1] = clamp255(data[idx + 1] + delta);
      data[idx + 2] = clamp255(data[idx + 2] + delta);
    }
  }
  ctx.putImageData(img, 0, 0);
}

function drawVoronoi(
  ctx: CanvasRenderingContext2D,
  p: FrontParams,
  rng: Phaser.Math.RandomDataGenerator,
  w: number,
  h: number,
): void {
  const n = Math.max(2, Math.round(p.voronoi.cells));
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  const tint = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    sx[i] = rng.frac() * w;
    sy[i] = rng.frac() * h;
    tint[i] = rng.frac() * 2 - 1;
  }
  const { edgeAlpha, fillAlpha } = p.voronoi;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let d1 = Infinity;
      let d2 = Infinity;
      let best = 0;
      for (let i = 0; i < n; i++) {
        const dx = x - sx[i];
        const dy = y - sy[i];
        const d = dx * dx + dy * dy;
        if (d < d1) {
          d2 = d1;
          d1 = d;
          best = i;
        } else if (d < d2) {
          d2 = d;
        }
      }
      const fill = tint[best] * fillAlpha * 255;
      const edge = Math.sqrt(d2) - Math.sqrt(d1) < 1.5 ? edgeAlpha * 255 : 0;
      const idx = (y * w + x) * 4;
      data[idx] = clamp255(data[idx] + fill - edge);
      data[idx + 1] = clamp255(data[idx + 1] + fill - edge);
      data[idx + 2] = clamp255(data[idx + 2] + fill - edge);
    }
  }
  ctx.putImageData(img, 0, 0);
}

function drawStripes(ctx: CanvasRenderingContext2D, p: FrontParams, w: number, h: number): void {
  const sw = Math.max(2, p.stripes.width);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((p.stripes.angle * Math.PI) / 180);
  ctx.fillStyle = `rgba(255, 255, 255, ${p.stripes.alpha})`;
  const diag = Math.ceil(Math.sqrt(w * w + h * h));
  for (let x = -diag; x < diag; x += sw * 2) {
    ctx.fillRect(x, -diag, sw, diag * 2);
  }
  ctx.restore();
}

function drawChecker(ctx: CanvasRenderingContext2D, p: FrontParams, w: number, h: number): void {
  const s = Math.max(4, p.checker.size);
  ctx.fillStyle = `rgba(0, 0, 0, ${p.checker.alpha})`;
  for (let y = 0; y < h; y += s) {
    for (let x = 0; x < w; x += s) {
      if ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 0) {
        ctx.fillRect(x, y, s, s);
      }
    }
  }
}

// ── public entry ───────────────────────────────────────────────────────────

/** Paints a full card front (gradient + selected pattern) onto `ctx`, rounded + bordered. */
export function drawFront(ctx: CanvasRenderingContext2D, params: FrontParams): void {
  const { width: w, height: h, radius } = params;
  const rng = new Phaser.Math.RandomDataGenerator([params.seed]);

  // Paint gradient + pattern on a rectangular offscreen, then composite through
  // a rounded clip (putImageData ignores clips, so it can't be done in place).
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const o = off.getContext('2d');
  if (!o) {
    return;
  }
  drawGradient(o, params.gradient, w, h);
  switch (params.pattern) {
    case 'speckle':
      drawSpeckle(o, params, rng, w, h);
      break;
    case 'perlin':
      drawPerlin(o, params, rng, w, h);
      break;
    case 'voronoi':
      drawVoronoi(o, params, rng, w, h);
      break;
    case 'stripes':
      drawStripes(o, params, w, h);
      break;
    case 'checker':
      drawChecker(o, params, w, h);
      break;
    case 'none':
      break;
  }

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  roundedRectPath(ctx, 0, 0, w, h, radius);
  ctx.clip();
  ctx.drawImage(off, 0, 0);
  ctx.restore();

  if (params.border) {
    roundedRectPath(ctx, 2, 2, w - 4, h - 4, radius - 2);
    ctx.strokeStyle = 'rgba(40, 40, 70, 0.35)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}
