# Memory (Phaser 3 + TypeScript)

Turn-based memory card game. No external assets — all card textures are generated procedurally at runtime.

## Run

```bash
npm install
npm run dev      # dev server (Vite)
npm run build    # type-check + production build into dist/
```

## Rules

- All cards are revealed for 5 seconds, then flip face-down.
- A random player starts. The active player either picks cards or skips the turn.
- Two cards flipped: match → keep them (1 pair) and go again; mismatch → next player.
- When no cards are left, the player with the most pairs wins.

## Settings

- Grid: 4×4, 4×6 (default), 6×6 — persisted in localStorage.
- Players: 2–4 (all human for now; `PlayerType` in `src/Player.ts` and the hook in
  `GameScene.startTurn()` are the entry points for future computer opponents).

## Structure

- `src/scenes/` — `PreloadScene` (procedural textures, future asset loading), `MainMenuScene`, `SettingsScene`, `GameScene` (turn logic).
- `src/Card.ts` — card container with flip animation.
- `src/textures.ts` — canvas-generated card faces (noise fronts) and back (linear gradient, one random pair per game from `src/gradients.ts`).
- `src/symbols.ts` — emoji pool used as card symbols.
