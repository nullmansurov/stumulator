const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Убедитесь, что этот файл существует
            contextIsolation: true, // Включите контекстную изоляцию для безопасности
            enableRemoteModule: false, // Отключите удалённый модуль
            backgroundThrottling: false, // Отключаем троттлинг в фоне, чтобы скрипты продолжали работать
        },
    });

    mainWindow.loadFile('index.html'); // Замените 'index.html' на путь к вашему HTML файлу

    // Убираем стандартное меню
    Menu.setApplicationMenu(null);
}

// Создаём окно после загрузки приложения
app.whenReady().then(createWindow);

// Закрываем приложение, если все окна закрыты (для macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Создаём окно заново, если приложение активируется (для macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
