const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pickerAPI', {
  onData: (callback) => ipcRenderer.on('picker-data', (_event, data) => callback(data)),
  confirm: (settings) => ipcRenderer.send('picker-choose', settings),
  cancel: () => ipcRenderer.send('picker-cancel'),
});
