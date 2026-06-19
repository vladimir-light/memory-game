import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { GameScene } from './scenes/GameScene';

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, MainMenuScene, SettingsScene, GameScene],
});

// Dev-only texture sandbox. The dynamic import keeps PlaygroundScene (and its
// lil-gui dependency) out of production builds, since this block is dead code
// when import.meta.env.DEV is false.
if (import.meta.env.DEV) {
  void import('./playground/PlaygroundScene').then(({ PlaygroundScene }) => {
    game.scene.add('Playground', PlaygroundScene);
    if (new URLSearchParams(window.location.search).has('debug')) {
      game.scene.getScenes(true).forEach((s) => game.scene.stop(s.scene.key));
      game.scene.start('Playground');
    }
  });
}
