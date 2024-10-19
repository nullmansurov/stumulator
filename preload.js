const { contextBridge, ipcRenderer } = require('electron');

// Предоставляем метод для рендерера, чтобы отправить сообщение в главный процесс
contextBridge.exposeInMainWorld('electronAPI', {
    pushUser: () => ipcRenderer.send('push-user')
});
