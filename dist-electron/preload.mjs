"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // Expose methods for saving and loading app data
  saveAppData: (data) => electron.ipcRenderer.invoke("save-app-data", data),
  loadAppData: () => electron.ipcRenderer.invoke("load-app-data"),
  // Expose fullscreen change listener
  onFullscreenChanged: (callback) => {
    electron.ipcRenderer.on("fullscreen-changed", (_event, isFullscreen) => callback(isFullscreen));
  },
  // Expose method for importing names from xlsx
  importNamesFromXlsx: () => electron.ipcRenderer.invoke("import-names-from-xlsx")
  // You can expose other APTs you need here.
  // ...
});
