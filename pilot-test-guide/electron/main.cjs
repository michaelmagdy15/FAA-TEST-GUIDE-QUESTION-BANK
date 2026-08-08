const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function setupZoom(win) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'mouseWheel' && (input.modifiers.includes('control') || input.modifiers.includes('meta'))) {
      const current = win.webContents.getZoomLevel();
      if (input.deltaY < 0) win.webContents.setZoomLevel(Math.min(current + 0.5, 6));
      else if (input.deltaY > 0) win.webContents.setZoomLevel(Math.max(current - 0.5, -3));
      event.preventDefault();
      return;
    }

    if (input.type !== 'keyDown') return;
    const ctrl = input.control || input.meta;
    if (!ctrl) return;
    const key = input.key;

    if (key === '=' || key === '+') {
      win.webContents.setZoomLevel(Math.min(win.webContents.getZoomLevel() + 0.5, 6));
      event.preventDefault();
    } else if (key === '-' || key === '_') {
      win.webContents.setZoomLevel(Math.max(win.webContents.getZoomLevel() - 0.5, -3));
      event.preventDefault();
    } else if (key === '0' || key === ')') {
      win.webContents.setZoomLevel(0);
      event.preventDefault();
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Pilot Test Guide',
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setupZoom(win);

  if (process.env.PTG_DEBUG) {
    win.webContents.on('console-message', (event, level, message) => {
      console.log(`[renderer:${level}] ${message}`);
    });
    win.webContents.on('did-fail-load', (event, code, desc, url) => {
      console.error(`[did-fail-load] ${code} ${desc} ${url}`);
    });
    win.webContents.on('did-finish-load', () => {
      console.log('[did-finish-load]', win.webContents.getURL());
    });
  }

  const distPath = path.join(__dirname, '..', 'dist', 'index.html');
  const devServerUrl = process.env.VITE_DEV_URL;

  if (app.isPackaged) {
    win.loadFile(distPath);
  } else if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else if (fs.existsSync(distPath)) {
    win.loadFile(distPath);
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
