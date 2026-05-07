# classicGame

A small collection of self-contained, browser-based retro typing games. Each variant lives in a single HTML file with no build step — open it in any modern browser and play.

## Variants

### `typing-game.html` — 8-Bit Type Attack
The original NES-style typing defense game. Letters and short words fall from the sky and you destroy them by typing the next letter shown. A small ship at the bottom can also fire lasers (SPACE) for emergencies.

- Three age/difficulty paces (4–6, 7–9, 10+)
- Wave system with breather breaks and boss waves
- Six rotating background themes (plumber sky, pipe dodge, sunset castle, night city, desert dunes, ice peaks)
- Combo / chain meter, persistent high score, mobile on-screen keyboard

**Controls:** type letters · ← → move · SPACE shoot · CTRL+P pause · CTRL+M sound

### `typing-game-neon.html` — Type Attack: Neon Rush
A synthwave roguelite spin on the original. Same core typing-defense gameplay with a meaner enemy roster, drop-based power-ups, a charge super, and run-to-run progression.

- **Enemy classes:** standard, zigzag, splitter (splits into smaller letters when typed), shielded (needs two passes), homing missile, multi-HP boss
- **Gold power-up letters** drop one of: SLOW · FREEZE · BOMB · SHIELD · DOUBLE · RAPID
- **BURST meter** — charges as you type; SHIFT releases a screen-clearing nova
- **Roguelite perks** — every 4 waves, choose 1 of 3 cards from a pool of 10 (extra life, bigger laser mag, overclock fire rate, gold streak score multiplier, burst core, time shard, auto-scan first letters, lucky drop, aegis plate, crit fire)
- Synthwave grid floor, parallax starfield, vapor sun, glow shadows, expanding shockwave rings, achievement toasts

**Controls:** type letters · ← → move · SPACE fire · **SHIFT = BURST** · 1/2/3 pick perks

## Running

Open the `.html` file directly in a browser, or serve the folder over any static HTTP server:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/typing-game-neon.html
```

No dependencies, no build, no install.

## Files

| File | Description |
|---|---|
| `typing-game.html` | Original 8-bit version |
| `typing-game-neon.html` | Synthwave roguelite version |
| `test-typing-game.js` | Headless smoke tests for the original game |
| `AGENTS.md` | Notes for AI coding agents working on this repo |
