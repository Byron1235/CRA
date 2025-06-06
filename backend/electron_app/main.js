const { app, BrowserWindow } = require('electron');
const path = require('path');

async function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  await win.loadFile('index.html');
}

app.whenReady().then(createWindow);

