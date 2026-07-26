const DB_NAME = 'k2-emulator-library';
const DB_VERSION = 1;
const GAME_STORE = 'games';

const SYSTEMS = [
  { id: 'nes', name: 'Nintendo Entertainment System', short: 'NES', extensions: ['nes'], description: 'Nintendo 8-bit home console.' },
  { id: 'snes', name: 'Super Nintendo', short: 'SNES', extensions: ['sfc', 'smc', 'fig'], description: 'Nintendo 16-bit home console.' },
  { id: 'n64', name: 'Nintendo 64', short: 'N64', extensions: ['z64', 'n64', 'v64'], description: 'Nintendo 64-bit home console.' },
  { id: 'gb', name: 'Game Boy', short: 'GB', extensions: ['gb'], description: 'Original Nintendo handheld.' },
  { id: 'gbc', name: 'Game Boy Color', short: 'GBC', extensions: ['gbc'], description: 'Color Nintendo handheld.' },
  { id: 'gba', name: 'Game Boy Advance', short: 'GBA', extensions: ['gba'], description: 'Nintendo 32-bit handheld.' },
  { id: 'nds', name: 'Nintendo DS', short: 'NDS', extensions: ['nds'], description: 'Dual-screen Nintendo handheld.' },
  { id: 'psx', name: 'PlayStation', short: 'PS1', extensions: ['cue', 'ccd', 'chd', 'pbp', 'iso'], description: 'Original Sony PlayStation.' },
  { id: 'psp', name: 'PlayStation Portable', short: 'PSP', extensions: ['iso', 'cso', 'pbp'], description: 'Sony portable console.' },
  { id: 'segaMD', name: 'Sega Genesis / Mega Drive', short: 'GEN', extensions: ['md', 'gen', 'bin'], description: 'Sega 16-bit home console.' },
  { id: 'segaMS', name: 'Sega Master System', short: 'SMS', extensions: ['sms'], description: 'Sega 8-bit home console.' },
  { id: 'segaGG', name: 'Sega Game Gear', short: 'GG', extensions: ['gg'], description: 'Sega color handheld.' },
  { id: 'sega32x', name: 'Sega 32X', short: '32X', extensions: ['32x'], description: 'Sega Genesis 32X add-on.' },
  { id: 'segaCD', name: 'Sega CD', short: 'SCD', extensions: ['cue', 'chd'], description: 'Sega CD add-on.' },
  { id: 'saturn', name: 'Sega Saturn', short: 'SAT', extensions: ['cue', 'chd'], description: 'Sega 32-bit home console.' },
  { id: 'arcade', name: 'Arcade', short: 'ARC', extensions: ['zip'], description: 'Arcade titles supported by available cores.' },
  { id: 'mame2003', name: 'MAME 2003', short: 'MAME', extensions: ['zip'], description: 'Classic arcade titles using MAME 2003.' },
  { id: 'atari2600', name: 'Atari 2600', short: '2600', extensions: ['a26', 'bin'], description: 'Atari home console.' },
  { id: 'atari5200', name: 'Atari 5200', short: '5200', extensions: ['a52', 'bin'], description: 'Atari home console.' },
  { id: 'atari7800', name: 'Atari 7800', short: '7800', extensions: ['a78', 'bin'], description: 'Atari home console.' },
  { id: 'lynx', name: 'Atari Lynx', short: 'LYNX', extensions: ['lnx'], description: 'Atari color handheld.' },
  { id: 'jaguar', name: 'Atari Jaguar', short: 'JAG', extensions: ['j64', 'jag'], description: 'Atari 64-bit home console.' },
  { id: 'coleco', name: 'ColecoVision', short: 'CV', extensions: ['col', 'rom'], description: 'Coleco home console.' },
  { id: 'virtualboy', name: 'Virtual Boy', short: 'VB', extensions: ['vb', 'vboy'], description: 'Nintendo stereoscopic console.' },
  { id: '3do', name: '3DO', short: '3DO', extensions: ['cue', 'chd', 'iso'], description: '3DO Interactive Multiplayer.' }
];

const SYSTEM_BY_ID = new Map(SYSTEMS.map((system) => [system.id, system]));
const state = { games: [], selectedFile: null, installPrompt: null, activeObjectUrl: null };

const elements = {
  navButtons: [...document.querySelectorAll('.nav-button')],
  views: [...document.querySelectorAll('.view')],
  pageTitle: document.querySelector('#pageTitle'),
  pageSubtitle: document.querySelector('#pageSubtitle'),
  openImporterButton: document.querySelector('#openImporterButton'),
  importerButtons: [...document.querySelectorAll('[data-open-importer]')],
  importDialog: document.querySelector('#importDialog'),
  importForm: document.querySelector('#importForm'),
  dropZone: document.querySelector('#dropZone'),
  romInput: document.querySelector('#romInput'),
  selectedFilePanel: document.querySelector('#selectedFilePanel'),
  selectedFileName: document.querySelector('#selectedFileName'),
  selectedFileMeta: document.querySelector('#selectedFileMeta'),
  clearFileButton: document.querySelector('#clearFileButton'),
  gameNameInput: document.querySelector('#gameNameInput'),
  gameSystemSelect: document.querySelector('#gameSystemSelect'),
  favoriteInput: document.querySelector('#favoriteInput'),
  saveGameButton: document.querySelector('#saveGameButton'),
  searchInput: document.querySelector('#searchInput'),
  systemFilter: document.querySelector('#systemFilter'),
  sortSelect: document.querySelector('#sortSelect'),
  emptyState: document.querySelector('#emptyState'),
  libraryGrid: document.querySelector('#libraryGrid'),
  systemsGrid: document.querySelector('#systemsGrid'),
  gameCardTemplate: document.querySelector('#gameCardTemplate'),
  playerDialog: document.querySelector('#playerDialog'),
  playerTitle: document.querySelector('#playerTitle'),
  playerSystem: document.querySelector('#playerSystem'),
  gameStage: document.querySelector('#game'),
  fullscreenButton: document.querySelector('#fullscreenButton'),
  closePlayerButton: document.querySelector('#closePlayerButton'),
  installButton: document.querySelector('#installButton')
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(GAME_STORE)) {
        const store = db.createObjectStore(GAME_STORE, { keyPath: 'id' });
        store.createIndex('name', 'name');
        store.createIndex('systemId', 'systemId');
        store.createIndex('addedAt', 'addedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GAME_STORE, mode);
    const store = transaction.objectStore(GAME_STORE);
    const request = callback(store);
    transaction.oncomplete = () => resolve(request?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }).finally(() => db.close());
}

const getAllGames = () => withStore('readonly', (store) => store.getAll());
const saveGameRecord = (game) => withStore('readwrite', (store) => store.put(game));
const deleteGameRecord = (id) => withStore('readwrite', (store) => store.delete(id));

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getExtension(filename) {
  return filename.toLowerCase().split('.').pop() || '';
}

function cleanGameName(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function suggestSystem(file) {
  const extension = getExtension(file.name);
  const matches = SYSTEMS.filter((system) => system.extensions.includes(extension));
  return matches.length === 1 ? matches[0].id : matches[0]?.id || 'n64';
}

function populateSystemControls() {
  elements.gameSystemSelect.innerHTML = SYSTEMS
    .map((system) => `<option value="${system.id}">${system.name}</option>`)
    .join('');
  elements.systemFilter.insertAdjacentHTML(
    'beforeend',
    SYSTEMS.map((system) => `<option value="${system.id}">${system.name}</option>`).join('')
  );
  elements.systemsGrid.innerHTML = SYSTEMS.map((system) => `
    <article class="system-card">
      <h3>${system.name}</h3>
      <p>${system.description}</p>
      <p><strong>${system.extensions.map((ext) => `.${ext}`).join(', ')}</strong></p>
    </article>
  `).join('');
}

function switchView(viewName) {
  const copy = {
    library: ['Your library', 'Import your own legally obtained game backups.'],
    systems: ['Supported systems', 'Choose the correct system when an extension is shared.'],
    help: ['Help & legal', 'How local storage, compatibility, and legal use work.']
  };
  elements.navButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.view === viewName));
  elements.views.forEach((view) => {
    const active = view.id === `${viewName}View`;
    view.classList.toggle('is-active', active);
    view.hidden = !active;
  });
  [elements.pageTitle.textContent, elements.pageSubtitle.textContent] = copy[viewName];
  elements.openImporterButton.hidden = viewName === 'help';
}

function chooseFile(file) {
  if (!file) return;
  state.selectedFile = file;
  elements.selectedFilePanel.hidden = false;
  elements.selectedFileName.textContent = file.name;
  elements.selectedFileMeta.textContent = `${formatBytes(file.size)} · .${getExtension(file.name) || 'unknown'}`;
  elements.gameNameInput.value = cleanGameName(file.name);
  elements.gameSystemSelect.value = suggestSystem(file);
  elements.saveGameButton.disabled = false;
}

function clearSelectedFile() {
  state.selectedFile = null;
  elements.romInput.value = '';
  elements.selectedFilePanel.hidden = true;
  elements.selectedFileName.textContent = '';
  elements.selectedFileMeta.textContent = '';
  elements.gameNameInput.value = '';
  elements.favoriteInput.checked = false;
  elements.saveGameButton.disabled = true;
}

function openImporter() {
  clearSelectedFile();
  elements.importDialog.showModal();
}

async function importSelectedGame() {
  const file = state.selectedFile;
  const name = elements.gameNameInput.value.trim();
  const systemId = elements.gameSystemSelect.value;
  if (!file || !name || !SYSTEM_BY_ID.has(systemId)) return;

  const game = {
    id: crypto.randomUUID(),
    name,
    systemId,
    filename: file.name,
    extension: getExtension(file.name),
    size: file.size,
    blob: file,
    favorite: elements.favoriteInput.checked,
    addedAt: Date.now(),
    lastPlayedAt: 0,
    playCount: 0
  };

  elements.saveGameButton.disabled = true;
  elements.saveGameButton.textContent = 'Saving…';
  try {
    await saveGameRecord(game);
    state.games.unshift(game);
    elements.importDialog.close();
    renderLibrary();
  } catch (error) {
    console.error(error);
    alert('The game could not be saved. Browser storage may be full or unavailable.');
  } finally {
    elements.saveGameButton.textContent = 'Save to library';
    elements.saveGameButton.disabled = !state.selectedFile;
  }
}

function getVisibleGames() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const system = elements.systemFilter.value;
  const sort = elements.sortSelect.value;
  const filtered = state.games.filter((game) => {
    const systemName = SYSTEM_BY_ID.get(game.systemId)?.name || '';
    const matchesSearch = !query || game.name.toLowerCase().includes(query) || systemName.toLowerCase().includes(query);
    const matchesSystem = system === 'all' || game.systemId === system;
    return matchesSearch && matchesSystem;
  });

  return filtered.sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'added') return b.addedAt - a.addedAt;
    if (sort === 'favorites') return Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name);
    return b.lastPlayedAt - a.lastPlayedAt || b.addedAt - a.addedAt;
  });
}

function coverColors(systemId) {
  const palettes = {
    nes: ['#d54c4c', '#53242a'], snes: ['#7567c8', '#26243d'], n64: ['#276b67', '#172d33'],
    gb: ['#77905a', '#263121'], gbc: ['#7a48d1', '#29203b'], gba: ['#425dca', '#19203e'],
    nds: ['#6e788f', '#222732'], psx: ['#3d678d', '#182632'], psp: ['#285b80', '#111f2b'],
    segaMD: ['#2a57a8', '#151f38'], segaMS: ['#d84646', '#2d1b26'], segaGG: ['#3a7b85', '#162b34'],
    arcade: ['#d06431', '#3b2119'], mame2003: ['#8b5a2b', '#2d2118']
  };
  return palettes[systemId] || ['#5c45c5', '#171b25'];
}

function renderLibrary() {
  const games = getVisibleGames();
  elements.libraryGrid.replaceChildren();
  elements.emptyState.hidden = state.games.length > 0;

  if (state.games.length > 0 && games.length === 0) {
    elements.libraryGrid.innerHTML = '<p class="prose">No games match the current search and filters.</p>';
    return;
  }

  games.forEach((game) => {
    const fragment = elements.gameCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.game-card');
    const coverButton = fragment.querySelector('.cover-button');
    const cover = fragment.querySelector('.cover-art');
    const favoriteButton = fragment.querySelector('.favorite-button');
    const removeButton = fragment.querySelector('.more-button');
    const system = SYSTEM_BY_ID.get(game.systemId);
    const [colorA, colorB] = coverColors(game.systemId);

    card.querySelector('h3').textContent = game.name;
    card.querySelector('p').textContent = system?.name || game.systemId;
    card.querySelector('.game-meta').textContent = game.playCount
      ? `${game.playCount} play${game.playCount === 1 ? '' : 's'}`
      : formatBytes(game.size);
    cover.dataset.system = system?.short || game.systemId.toUpperCase();
    cover.style.setProperty('--cover-a', colorA);
    cover.style.setProperty('--cover-b', colorB);
    favoriteButton.textContent = game.favorite ? '★' : '☆';
    favoriteButton.classList.toggle('is-favorite', game.favorite);

    coverButton.addEventListener('click', () => launchGame(game.id));
    favoriteButton.addEventListener('click', async () => {
      game.favorite = !game.favorite;
      await saveGameRecord(game);
      renderLibrary();
    });
    removeButton.addEventListener('click', async () => {
      if (!confirm(`Remove “${game.name}” from this browser?`)) return;
      await deleteGameRecord(game.id);
      state.games = state.games.filter((item) => item.id !== game.id);
      renderLibrary();
    });

    elements.libraryGrid.append(fragment);
  });
}

function buildPlayerDocument(game, objectUrl) {
  const system = SYSTEM_BY_ID.get(game.systemId);
  const safeName = JSON.stringify(game.name).replace(/</g, '\\u003c');
  const safeUrl = JSON.stringify(objectUrl).replace(/</g, '\\u003c');
  const safeSystem = JSON.stringify(game.systemId);
  return `<!doctype html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>html,body,#game{width:100%;height:100%;margin:0;background:#000;overflow:hidden}body{font-family:system-ui;color:white}.error{display:grid;place-items:center;height:100%;padding:24px;text-align:center;box-sizing:border-box}</style></head>
<body><div id="game"></div><script>
window.EJS_player = '#game';
window.EJS_core = ${safeSystem};
window.EJS_gameName = ${safeName};
window.EJS_gameUrl = ${safeUrl};
window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
window.EJS_startOnLoaded = true;
window.EJS_fullscreenOnLoaded = false;
window.EJS_color = '#7c5cff';
window.EJS_backgroundColor = '#000000';
window.EJS_threads = false;
window.EJS_ready = function(){ parent.postMessage({type:'k2-emulator-ready'}, location.origin); };
window.addEventListener('error', function(event){ parent.postMessage({type:'k2-emulator-error', message:event.message}, location.origin); });
<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script></body></html>`;
}

async function launchGame(id) {
  const game = state.games.find((item) => item.id === id);
  if (!game?.blob) return;
  const system = SYSTEM_BY_ID.get(game.systemId);

  if (state.activeObjectUrl) URL.revokeObjectURL(state.activeObjectUrl);
  state.activeObjectUrl = URL.createObjectURL(game.blob);
  game.lastPlayedAt = Date.now();
  game.playCount = (game.playCount || 0) + 1;
  await saveGameRecord(game);

  elements.playerTitle.textContent = game.name;
  elements.playerSystem.textContent = system?.name || game.systemId;
  elements.gameStage.replaceChildren();
  const iframe = document.createElement('iframe');
  iframe.title = `${game.name} emulator`;
  iframe.allow = 'autoplay; fullscreen; gamepad';
  iframe.setAttribute('allowfullscreen', '');
  iframe.style.cssText = 'width:100%;height:100%;border:0;background:#000';
  iframe.srcdoc = buildPlayerDocument(game, state.activeObjectUrl);
  elements.gameStage.append(iframe);
  elements.playerDialog.showModal();
  renderLibrary();
}

function closePlayer() {
  elements.playerDialog.close();
  elements.gameStage.replaceChildren();
  if (state.activeObjectUrl) {
    URL.revokeObjectURL(state.activeObjectUrl);
    state.activeObjectUrl = null;
  }
}

function bindEvents() {
  elements.navButtons.forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
  elements.openImporterButton.addEventListener('click', openImporter);
  elements.importerButtons.forEach((button) => button.addEventListener('click', openImporter));
  elements.romInput.addEventListener('change', () => chooseFile(elements.romInput.files[0]));
  elements.clearFileButton.addEventListener('click', clearSelectedFile);
  elements.saveGameButton.addEventListener('click', importSelectedGame);
  elements.searchInput.addEventListener('input', renderLibrary);
  elements.systemFilter.addEventListener('change', renderLibrary);
  elements.sortSelect.addEventListener('change', renderLibrary);
  elements.closePlayerButton.addEventListener('click', closePlayer);
  elements.fullscreenButton.addEventListener('click', () => elements.gameStage.requestFullscreen?.());

  ['dragenter', 'dragover'].forEach((eventName) => elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach((eventName) => elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove('is-dragging');
  }));
  elements.dropZone.addEventListener('drop', (event) => chooseFile(event.dataTransfer.files[0]));
  elements.playerDialog.addEventListener('cancel', (event) => { event.preventDefault(); closePlayer(); });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.installPrompt = event;
    elements.installButton.hidden = false;
  });
  elements.installButton.addEventListener('click', async () => {
    if (!state.installPrompt) return;
    await state.installPrompt.prompt();
    state.installPrompt = null;
    elements.installButton.hidden = true;
  });
}

async function init() {
  populateSystemControls();
  bindEvents();
  try {
    state.games = await getAllGames();
  } catch (error) {
    console.error(error);
    alert('Local game storage is unavailable in this browser.');
  }
  renderLibrary();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service worker registration failed', error));
  }
}

init();
