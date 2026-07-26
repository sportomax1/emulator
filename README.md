# K2 Emulator

A modern, installable browser frontend for playing legally obtained classic-game backups with [EmulatorJS](https://emulatorjs.org/).

## Features

- User-loaded ROMs only; no games, BIOS files, or copyrighted artwork are included
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

## Legal notice

This project does not provide, download, scrape, or bundle games, ROMs, BIOS files, firmware, encryption keys, or copyrighted game artwork. Only load files you are legally permitted to use. EmulatorJS and its emulator cores retain their respective licenses.

## EmulatorJS

The player loads the stable EmulatorJS build from its official CDN:

```text
https://cdn.emulatorjs.org/stable/data/loader.js
```

See the official documentation for supported systems and configuration options.
