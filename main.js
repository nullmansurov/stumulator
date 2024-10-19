const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            backgroundThrottling: false, // Скрипты продолжают работать при сворачивании
        },
    });

    mainWindow.loadFile('index.html');
    Menu.setApplicationMenu(null);
}

ipcMain.on('push-user', () => {
    if (mainWindow) {
        mainWindow.show();  // Показать окно, если оно свернуто
        mainWindow.focus(); // Вернуть фокус на окно
    }
});

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
