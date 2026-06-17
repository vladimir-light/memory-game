### 1. promt (initial)

I need a simple "memory" game in PhaserJS (latest v3). Since there are no assets, lets stick with basic shapes for the "cards" (rectangular, not squares, rounded corners). 5x5 Grid. 
Turn-based gameplay. Card should have some random/noise/gradiens background on the front-side + a symbol to look for. 
For symbols let stick with "letters" (aka symbols) of some exotic font (e.g. Emojiis). Backside of the card is same for all: A linear gradient (two random, but not same/similar colors. Maybe a static set of several possible gradients. Game picks one gradient-pair randomly by game start)

Everything in TypeScrpt.
In the game settings player may choose between 4x4, 5x5 (default) and 6x6 grid.

PreloadScene (for (pre)loading all assets), MainMenuScene (new game, settings, exit), and the GameScene.
Currently only "human" players. So even active player changes -> everything happens by human input, _BUT_ I'd like to add "computer" opponents later.

Gameplay/flow:

- All card are open/visible for 5 Seconds, then flip to a backside.
- Startplayer selected randomly.
- Active player has only two options:

1 - start picking cards.
2 - skip the turn.

If one player has a "match", he continues to play till a "missmatch", then next player starts. It goes this way until no cards left.
Winning conditions: Player with the most "pairs" wins.

If you need clarifications, ask first. If not, start building.

### 2. promt

Now two more things:

1. Starting player must click "begin" ones before "memorizing-phase" starts. Game starts with all card "face-down", player click/accept beginn, all card flip to their "visible" side, whait 5 seconds and then flip back. Currently, the game begins and human player needs some time to get familiar with the UI, but the countdown already ticking and player may _miss_ the oportunity to memorize the cards. That's way starting player must actively click to begin the game.
2. Active player have limited time (5 Seconds) for their turn. If time runs out -> turn passes to the next player. This feature must be on/off in settings. off - is default. While playing, player _must_ see the timer (bottom-left corner)

### 3. promt

now add computer players

### 4. promt

In @src/symbols.ts you've created a static list of emojiis to use a pictogram for the cards.

I'd like to expand this Idea.
Firstly, expand the current list with another 20 (but only few (1-2) may be emotions)
Then add further "thematic" emojiis as symbols-sets (plural). For Example, a List of all emotions (like 😅) and/or only animals or only vehicles.
In the settings I may choose between those list. It will add additional difficulty.
Current List must be default.

If you need any clarifications, ask first!
Q: Which thematic symbol-sets should I add alongside the (expanded) default? Each will have at least 18 emojis so it works on the 6×6 grid.
A: Animals, Emotions / Faces, Vehicles, Food & Drink


### 5. promt (semi-related)

I'd like to have some sort of "debug-bar" or "debug-tools" or some sort of sandbox/playground, which *is not part of the game* (e.g. to play around with noise and/or card background. As far as I know PhaserJS has tools to generate perlin noise, voronoi and all other similar patterns)
Lets try to implement that. Ponder about it and then show me your ideas before implementing those. After Q/A, we will have some ideas/directions.