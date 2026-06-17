/**
 * Dev-only texture sandbox. Not part of the shipped game: it is registered only
 * under `import.meta.env.DEV` (see main.ts) and reached via the hidden
 * Playground button on the main menu or `?debug` in the URL.
 *
 * Tune card-front looks live with lil-gui, eyeball a grid of seed variants, and
 * copy the params/PNG back out. All generation lives in ./generators.ts.
 */
import Phaser from 'phaser';
import GUI from 'lil-gui';
import { Button } from '../ui';
import { defaultFrontParams, drawFront, type FrontParams } from './generators';

const PREVIEW_KEY = 'pg-preview';
const VARIANT_KEYS = ['pg-var-0', 'pg-var-1', 'pg-var-2', 'pg-var-3', 'pg-var-4', 'pg-var-5'];

export class PlaygroundScene extends Phaser.Scene {
  private params: FrontParams = defaultFrontParams();
  private gui?: GUI;
  private regenEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super('Playground');
  }

  create(): void {
    this.params = defaultFrontParams();
    const { height } = this.scale;

    this.add
      .text(24, 20, 'Texture Playground  ·  dev sandbox', {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: '#f6d365',
      })
      .setOrigin(0, 0);
    this.add
      .text(24, 60, 'Tune on the right · changes apply live · "Reroll" for a new seed', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#aaaacc',
      })
      .setOrigin(0, 0);

    // paint textures once so the images below have something to point at
    this.paint(PREVIEW_KEY, this.params);
    VARIANT_KEYS.forEach((key, i) => this.paint(key, this.variantParams(i)));

    // large live preview (left)
    const previewH = 360;
    const previewW = previewH * (this.params.width / this.params.height);
    this.add.image(40 + previewW / 2, 360, PREVIEW_KEY).setDisplaySize(previewW, previewH);
    this.add
      .text(40 + previewW / 2, 360 + previewH / 2 + 18, 'live preview', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#8888aa',
      })
      .setOrigin(0.5, 0);

    // variant grid (centre) — same params, different seeds
    const cols = 2;
    const cellH = 150;
    const cellW = cellH * (this.params.width / this.params.height);
    const gridX = 360;
    const gridY = 150;
    const gap = 18;
    this.add
      .text(gridX, gridY - 28, 'seed variants', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#8888aa',
      })
      .setOrigin(0, 0.5);
    VARIANT_KEYS.forEach((key, i) => {
      const cx = gridX + (i % cols) * (cellW + gap) + cellW / 2;
      const cy = gridY + Math.floor(i / cols) * (cellH + gap) + cellH / 2;
      this.add.image(cx, cy, key).setDisplaySize(cellW, cellH);
    });

    new Button(this, 100, height - 40, 'Back', () => this.scene.start('MainMenu'), {
      width: 150,
      height: 44,
      fontSize: 20,
    });

    this.buildGui();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.regenEvent?.remove();
      this.gui?.destroy();
      this.gui = undefined;
    });
  }

  // ── painting ───────────────────────────────────────────────────────────

  /** Each variant reuses every param except the seed, which is salted by index. */
  private variantParams(i: number): FrontParams {
    return { ...this.params, seed: `${this.params.seed}#${i}` };
  }

  private paint(key: string, params: FrontParams): void {
    const tex = this.textures.exists(key)
      ? (this.textures.get(key) as Phaser.Textures.CanvasTexture)
      : this.textures.createCanvas(key, params.width, params.height);
    if (!tex) {
      return;
    }
    drawFront(tex.getContext(), params);
    tex.refresh();
  }

  /** Coalesces rapid GUI changes (e.g. slider drags) into one repaint. */
  private markDirty(): void {
    this.regenEvent?.remove();
    this.regenEvent = this.time.delayedCall(80, () => this.repaintAll());
  }

  private repaintAll(): void {
    this.paint(PREVIEW_KEY, this.params);
    VARIANT_KEYS.forEach((key, i) => this.paint(key, this.variantParams(i)));
  }

  // ── controls ─────────────────────────────────────────────────────────────

  private buildGui(): void {
    const gui = new GUI({ title: 'Texture Playground' });
    this.gui = gui;
    const p = this.params;

    gui.add(p, 'pattern', ['none', 'speckle', 'perlin', 'voronoi', 'stripes', 'checker']).name('Pattern');
    gui.add(p, 'seed').name('Seed').listen();
    gui.add(p, 'border').name('Border');

    const g = gui.addFolder('Gradient');
    g.add(p.gradient, 'type', ['linear', 'radial']).name('Type');
    g.add(p.gradient, 'angle', 0, 360, 1).name('Angle');
    g.add(p.gradient, 'hue1', 0, 360, 1).name('Hue 1');
    g.add(p.gradient, 'hue2', 0, 360, 1).name('Hue 2');
    g.add(p.gradient, 'saturation', 0, 100, 1).name('Saturation');
    g.add(p.gradient, 'lightTop', 0, 100, 1).name('Light top');
    g.add(p.gradient, 'lightBottom', 0, 100, 1).name('Light bottom');

    const sp = gui.addFolder('Speckle').close();
    sp.add(p.speckle, 'count', 0, 4000, 10).name('Count');
    sp.add(p.speckle, 'sizeMin', 0, 6, 0.1).name('Size min');
    sp.add(p.speckle, 'sizeMax', 0, 8, 0.1).name('Size max');
    sp.add(p.speckle, 'alpha', 0, 0.5, 0.01).name('Alpha');
    sp.add(p.speckle, 'darkRatio', 0, 1, 0.01).name('Dark ratio');

    const pe = gui.addFolder('Perlin').close();
    pe.add(p.perlin, 'scale', 2, 120, 1).name('Scale');
    pe.add(p.perlin, 'octaves', 1, 6, 1).name('Octaves');
    pe.add(p.perlin, 'contrast', 0.2, 4, 0.1).name('Contrast');
    pe.add(p.perlin, 'strength', 0, 1, 0.01).name('Strength');

    const vo = gui.addFolder('Voronoi').close();
    vo.add(p.voronoi, 'cells', 2, 120, 1).name('Cells');
    vo.add(p.voronoi, 'edgeAlpha', 0, 1, 0.01).name('Edge alpha');
    vo.add(p.voronoi, 'fillAlpha', 0, 0.6, 0.01).name('Fill alpha');

    const st = gui.addFolder('Stripes').close();
    st.add(p.stripes, 'width', 2, 40, 1).name('Width');
    st.add(p.stripes, 'angle', 0, 180, 1).name('Angle');
    st.add(p.stripes, 'alpha', 0, 0.6, 0.01).name('Alpha');

    const ch = gui.addFolder('Checker').close();
    ch.add(p.checker, 'size', 4, 60, 1).name('Size');
    ch.add(p.checker, 'alpha', 0, 0.6, 0.01).name('Alpha');

    const act = gui.addFolder('Actions');
    act.add({ reroll: () => this.reroll() }, 'reroll').name('🎲 Reroll seed');
    act.add({ copyParams: () => void this.copyParams() }, 'copyParams').name('Copy params JSON');
    act.add({ copyPng: () => void this.copyPng() }, 'copyPng').name('Copy preview PNG');

    // one global handler covers every slider/dropdown in the GUI and its folders
    gui.onChange(() => this.markDirty());
  }

  private reroll(): void {
    this.params.seed = Math.random().toString(36).slice(2, 9);
    this.repaintAll();
  }

  private async copyParams(): Promise<void> {
    const json = JSON.stringify(this.params, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      console.info('[playground] params copied to clipboard');
    } catch {
      console.info('[playground] clipboard blocked — params below:\n', json);
    }
  }

  private async copyPng(): Promise<void> {
    const tex = this.textures.get(PREVIEW_KEY) as Phaser.Textures.CanvasTexture;
    const url = (tex.getSourceImage() as HTMLCanvasElement).toDataURL('image/png');
    try {
      await navigator.clipboard.writeText(url);
      console.info('[playground] preview PNG data URL copied to clipboard');
    } catch {
      console.info('[playground] clipboard blocked — PNG data URL below:\n', url);
    }
  }
}
