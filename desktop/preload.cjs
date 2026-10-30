const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('domfeDesktop', {
  prepareMedia: () => ipcRenderer.invoke('media:prepare'),
  onMediaProgress: callback => {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on('media:progress', listener);
    return () => ipcRenderer.removeListener('media:progress', listener);
  }
});
