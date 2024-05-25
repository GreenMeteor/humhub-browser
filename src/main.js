const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('path');

let mainWindow;

function createWindow(url = '') {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true
      },
      icon: path.join(__dirname, 'icons', '512x512.png')
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html')); // Load index.html
  }

  // If a URL is provided, verify if it's a HumHub instance
  if (url) {
    verifyHumHubInstance(url);
  }
}

function verifyHumHubInstance(url) {
  const manifestUrl = url.endsWith('/') ? `${url}manifest.json` : `${url}/manifest.json`;
  const request = net.request(manifestUrl);

  request.on('response', (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const manifest = JSON.parse(data);

        // Check if the manifest contains required HumHub properties
        if (manifest && manifest.name && manifest.start_url === url) {
          mainWindow.loadURL(url);
          console.log(`Loaded ${manifest.name} (${url})`);
        } else {
          console.error('Invalid HumHub instance');
          // Send message back to renderer process indicating failure
          mainWindow.webContents.send('verification-failed', { url });
        }
      } catch (error) {
        console.error('Error parsing manifest.json:', error);
        // Send message back to renderer process indicating failure
        mainWindow.webContents.send('verification-failed', { url });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Error requesting manifest.json:', error);
    // Send message back to renderer process indicating failure
    mainWindow.webContents.send('verification-failed', { url });
  });

  request.end();
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
  if (!mainWindow) {
    createWindow();
  }
});

ipcMain.on('change-url', (event, url) => {
  createWindow(url);
});
