# Memory-Game (PhaserJS v3.90)

> This was completely vibe-coded (using Claude Fabel 5, btw.) 
> You even may see all the promts I used in PROMT_HISTORY.md. 
> Fun fact: Initial promt contains a mistake. I said I need a 5x5 grid (25 cards which makes no sense), but claude spotted this right away and made some suggestions (a joker card, a triplet or 6x4 grid)


## Demo
<video width="800" height="640" controls>
  <source src="demo_30fps.webm" type="video/mp4">
</video>

## Run

```bash
pnpm install      # or `npm install` -> install deps
pnpm run dev      # or `npm run dev` -> start dev-server
pnpm run build    # or `npm run build` -> type-check + production build into dist/
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
- Players: 2–4, each slot toggleable between Human and CPU (any mix, including all-CPU).
- Computer difficulty: Easy / Medium / Hard — controls how reliably CPUs memorize revealed
  cards and how fast they forget (`AI_PROFILES` in `src/Ai.ts`). CPUs watch every reveal,
  including the initial 5-second preview and other players' turns, and never skip.

## Structure

- `src/scenes/` — `PreloadScene` (procedural textures, future asset loading), `MainMenuScene`, `SettingsScene`, `GameScene` (turn logic).
- `src/Ai.ts` — computer opponent: imperfect decaying card memory, plays via the same GameScene entry points as humans.
- `src/Card.ts` — card container with flip animation.
- `src/textures.ts` — canvas-generated card faces (noise fronts) and back (linear gradient, one random pair per game from `src/gradients.ts`).
- `src/symbols.ts` — emoji pool used as card symbols.
