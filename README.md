# Memory (Phaser 3 + TypeScript)

Turn-based memory card game. No external assets — all card textures are generated procedurally at runtime.

## Run

```bash
npm install
npm run dev      # dev server (Vite)
npm run build    # type-check + production build into dist/
```

## Rules

- The board starts face-down; the randomly chosen starting player presses **Begin**.
- All cards are then revealed for 5 seconds and flip face-down again.
- The active player either picks cards or skips the turn (optionally within a 5 s limit).
- Two cards flipped: match → keep them (1 pair) and go again; mismatch → next player.
- When no cards are left, the player with the most pairs wins.

## Settings

- Grid: 4×4, 4×6 (default), 6×6 — persisted in localStorage.
- Turn time limit: Off (default) or 5 s per turn (`TURN_SECONDS` in `src/settings.ts`); the countdown is shown bottom-left and a timeout passes the turn.
- Players: 2–4 (all human for now; `PlayerType` in `src/Player.ts` and the hook in
  `GameScene.startTurn()` are the entry points for future computer opponents).

## Structure

- `src/scenes/` — `PreloadScene` (procedural textures, future asset loading), `MainMenuScene`, `SettingsScene`, `GameScene` (turn logic).
- `src/Card.ts` — card container with flip animation.
- `src/textures.ts` — canvas-generated card faces (noise fronts) and back (linear gradient, one random pair per game from `src/gradients.ts`).
- `src/symbols.ts` — emoji pool used as card symbols.
