const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-app'),
  close: () => ipcRenderer.send('close-app'),
  showAboutDialog: () => ipcRenderer.send('show-about-dialog'),

  checkInstalledPackages: () => ipcRenderer.send('check-installed-packages'),
  onCheckInstalledResult: (callback) => ipcRenderer.on('check-installed-result', (event, ...args) => callback(...args)),
  uninstallApp: (appData) => ipcRenderer.send('uninstall-app', appData),
  onUninstallationStatus: (callback) => ipcRenderer.on('uninstallation-status', (event, ...args) => callback(...args)),

  installApp: (appData) => ipcRenderer.send('install-app', appData),
  onInstallationStatus: (callback) => ipcRenderer.on('installation-status', (event, ...args) => callback(...args)),

  getAppDetails: (appId) => ipcRenderer.send('get-app-details', appId),
  onAppDetailsResult: (callback) => ipcRenderer.on('app-details-result', (event, ...args) => callback(...args)),
});