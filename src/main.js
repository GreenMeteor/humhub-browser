const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icons', '512x512.png')
  });

  mainWindow.loadURL(url); // Load the provided URL

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow('https://community.humhub.com');
});

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

ipcMain.on('change-url', (event, url) => {
  if (mainWindow) {
    mainWindow.loadURL(url); // Load the new URL
  }
});
