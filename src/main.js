const { app, BrowserWindow, ipcMain, session, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'icons', '512x512.png')
  });

  if (url) {
    mainWindow.loadURL(url);
  } else {
    const indexPath = path.join(__dirname, 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle certificate errors
  session.defaultSession.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    console.error(`Certificate error for URL ${url}: ${error}`);
    console.error(`Certificate details: ${JSON.stringify(certificate, null, 2)}`);

    // Show a dialog to the user
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Ignore', 'Cancel'],
      defaultId: 1,
      title: 'Certificate Error',
      message: `There is a problem with the certificate for ${url}. Do you want to continue?`,
      detail: `Error: ${error}\nIssuer: ${certificate.issuerName}`
    }).then(result => {
      if (result.response === 0) {
        callback(true); // Bypass the error
      } else {
        callback(false); // Do not bypass the error
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow();
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
    mainWindow.loadURL(url);
  }
});
