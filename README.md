# K2 Emulator

A modern, installable browser frontend for playing legally obtained classic-game backups with [EmulatorJS](https://emulatorjs.org/).

## Features

- User-loaded ROMs only; no commercial games, BIOS files, firmware, keys, or copyrighted artwork are included
- NES, SNES, Nintendo 64, Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, PlayStation, PSP, Sega Genesis/Mega Drive, Master System, Game Gear, 32X, Atari, Arcade, and more
- Automatic system suggestions based on file extension
- Drag-and-drop and file-picker import
- Fullscreen play and gamepad support through EmulatorJS
- Recently played library stored locally in IndexedDB
- Favorites, search, and per-game metadata
- Installable PWA shell
- Responsive desktop, tablet, and phone interface

## Run locally

Because browser security restrictions affect ROM files and service workers, use a local web server instead of opening `index.html` directly.

```bash
npx serve .
```

Then open the local URL printed by `serve`.

## Deploy

This repository is static and works on Vercel, Netlify, GitHub Pages, or any ordinary static host.

## Emulator references

- [Official EmulatorJS documentation](https://emulatorjs.org/docs/)
- [Supported systems and cores](https://emulatorjs.org/docs/systems/)
- [Embedding instructions](https://emulatorjs.org/docs/embed/)
- [Official EmulatorJS GitHub repository](https://github.com/EmulatorJS/EmulatorJS)
- [Official releases](https://github.com/EmulatorJS/EmulatorJS/releases)

The player currently loads the stable EmulatorJS build from its official CDN:

```text
https://cdn.emulatorjs.org/stable/data/loader.js
```

## Places to find legal homebrew games

These are research and discovery sources, not blanket permission to redistribute every file found there. Check each individual game’s license and author terms.

- [Homebrew Hub](https://hh.gbdev.io/) — Game Boy, Game Boy Color, Game Boy Advance, and NES homebrew
- [Homebrew Hub disclaimer](https://hh.gbdev.io/disclaimer/) — archive policy and developer rights
- [itch.io homebrew tag](https://itch.io/games/tag-homebrew) — creator-hosted homebrew projects with varying terms
- [GitHub homebrew-game projects](https://github.com/topics/homebrew-game) — source projects that may include licensed compiled ROMs

## Requirements for built-in games

Before committing a game ROM for automatic loading:

1. Confirm that the game is homebrew, public-domain, or open-source.
2. Verify that the license permits redistribution of the compiled ROM, not only its source code.
3. Include the applicable license and attribution in this repository.
4. Record the original project and download source.
5. Do not commit commercial ROMs, BIOS files, firmware, encryption keys, or copyrighted box art.

## Legal notice

This project does not provide, download, scrape, or bundle commercial games, ROMs, BIOS files, firmware, encryption keys, or copyrighted game artwork. Only load files you are legally permitted to use. EmulatorJS and its emulator cores retain their respective licenses.
