const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const nextApp = next({ dev: isDev, dir: app.getAppPath() });
const handle = nextApp.getRequestHandler();

function createWindow() {
  nextApp.prepare().then(() => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.listen(0, () => {
      const port = server.address().port;
      win.loadURL(`http://localhost:${port}`);

      if (isDev) {
        win.webContents.openDevTools({ mode: 'detach' });
      }
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});