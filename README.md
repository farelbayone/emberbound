# ✦ EMBERBOUND — The Little Spark

An original pixel-art side-scrolling platform adventure built with vanilla HTML, CSS and JavaScript. No game engine, build step, server, or third-party runtime dependency required.

> Explore a fading forest as Pip, collect glowing embers, bounce on Thornbugs, activate checkpoints, and reach the ancient portal.

## Play locally
Open `index.html` in a modern browser. That's it.

## Controls
| Action | Keyboard | Touch |
|---|---|---|
| Move | `A` / `D` or `←` / `→` | ◀ / ▶ |
| Jump | `Space` / `W` / `↑` | ▲ |
| Pause | `Esc` | — |

## Features
- Original character, world, enemies and pixel-art style
- Three handcrafted stages with increasing challenge
- Side-scrolling camera and layered parallax scenery
- Platform collision, gravity, jumping and enemy interactions
- Collectible embers, particles, checkpoints and portal goal
- Lives, elapsed timer, stage HUD and progress indicator
- Auto-save / continue using browser `localStorage`
- Procedurally synthesized sound effects with mute toggle
- Keyboard and mobile touch controls
- Responsive layout and no external game-engine dependency

## GitHub Pages deployment
This project is intentionally **static-hosting compatible**.

1. Create a GitHub repository, for example `emberbound`.
2. Upload the contents of this folder (keep `index.html`, `css/`, `js/`, and `assets/` at the repository root).
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/(root)`, then save.
5. Wait for the Pages URL to appear.

## About the "full-stack" part
GitHub Pages serves static files only. It cannot execute PHP/Node server code or host a database. This release is a complete playable client-side game; save data is stored in the player's browser. If you later want shared accounts, global leaderboards, cloud saves or multiplayer, connect a separate backend (for example Supabase/Firebase or a hosted API) while keeping this front end on GitHub Pages.

## Project structure
```text
emberbound/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── game.js
└── assets/
    └── favicon.svg
```

## License
MIT — see `LICENSE`.
