const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pickerAPI', {
  onSources: (callback) => ipcRenderer.on('picker-sources', (_event, sources) => callback(sources)),
  choose: (sourceId) => ipcRenderer.send('picker-choose', sourceId),
  cancel: () => ipcRenderer.send('picker-cancel'),
});
