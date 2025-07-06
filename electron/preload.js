const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Store methods - these will fall back to localStorage
  getData: (key) => ipcRenderer.invoke('electron-store-get', key),
  saveData: (key, value) => ipcRenderer.invoke('electron-store-set', key, value),
  deleteData: (key) => ipcRenderer.invoke('electron-store-delete', key),
  clearData: () => ipcRenderer.invoke('electron-store-clear'),
  
  // Platform info
  platform: process.platform,
  
  // Indicate this is Electron (even though store isn't working)
  isElectron: true,
});

// Prevent the renderer process from crashing
window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded successfully');
});