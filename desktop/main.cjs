const { app, BrowserWindow, dialog, ipcMain, protocol, powerSaveBlocker, session } = require('electron');
const path = require('node:path');
const { chooseMediaRoot, prepareMedia, validateManifest } = require('./media.cjs');
const { createContentHandler } = require('./content.cjs');
const manifest = require('../config/media-manifest.json');

protocol.registerSchemesAsPrivileged([
  { scheme: 'domfe', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

let window;
let mediaRoot;
let preparation;
let blocker;
const shutdown = new AbortController();

function portableRoot() {
  if (!app.isPackaged) return app.getAppPath();
  if (process.platform === 'win32' && process.env.PORTABLE_EXECUTABLE_DIR) return process.env.PORTABLE_EXECUTABLE_DIR;
  if (process.platform === 'linux' && process.env.APPIMAGE) return path.dirname(process.env.APPIMAGE);
  const directory = path.dirname(app.getPath('exe'));
  return process.platform === 'darwin' ? path.resolve(directory, '../../..') : directory;
}

function createWindow() {
  window = new BrowserWindow({
    title: 'Domfe TV', width: 1440, height: 900, minWidth: 960, minHeight: 600,
    icon: path.join(app.getAppPath(), 'assets/images/logo-domfe.png'),
    backgroundColor: '#f3f7fc', autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false, contextIsolation: true, sandbox: true
    }
  });
  window.setMenu(null);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'Escape' && window.isFullScreen()) {
      window.setFullScreen(false);
      event.preventDefault();
    }
  });
  window.loadURL('domfe://app/index.html');
  window.on('closed', () => { window = null; });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
  app.whenReady().then(async () => {
    validateManifest(manifest);
    mediaRoot = await chooseMediaRoot(portableRoot(), app.getPath('userData'));
    protocol.handle('domfe', createContentHandler(app.getAppPath(), mediaRoot, manifest));
    session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) => callback(permission === 'fullscreen'));
    ipcMain.handle('media:prepare', event => {
      if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) {
        throw new Error('Solicitação não autorizada.');
      }
      if (!preparation) {
        let lastReport = 0;
        preparation = prepareMedia(mediaRoot, manifest, progress => {
          const now = Date.now();
          if (progress.phase === 'downloading' && now - lastReport < 150) return;
          lastReport = now;
          if (window && !window.isDestroyed()) window.webContents.send('media:progress', progress);
        }, { signal: shutdown.signal })
          .then(() => ({ ok: true, mediaRoot }))
          .catch(error => ({ ok: false, message: `Não foi possível preparar as mídias. Verifique a conexão e tente novamente. ${error.message}` }))
          .finally(() => { preparation = null; });
      }
      return preparation;
    });
    blocker = powerSaveBlocker.start('prevent-display-sleep');
    createWindow();
    app.on('activate', () => { if (!window) createWindow(); });
  }).catch(error => {
    dialog.showErrorBox('Domfe TV', error.message);
    app.quit();
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', () => {
    shutdown.abort();
    if (blocker !== undefined && powerSaveBlocker.isStarted(blocker)) powerSaveBlocker.stop(blocker);
  });
}
