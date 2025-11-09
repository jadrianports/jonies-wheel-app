import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // Expose methods for saving and loading app data
  saveAppData: (data: any) => ipcRenderer.invoke('save-app-data', data),
  loadAppData: () => ipcRenderer.invoke('load-app-data'),

  // Expose fullscreen change listener
  onFullscreenChanged: (callback: (isFullscreen: boolean) => void) => {
    ipcRenderer.on('fullscreen-changed', (event, isFullscreen) => callback(isFullscreen))
  },

  // Expose method for importing names from xlsx
  importNamesFromXlsx: () => ipcRenderer.invoke('import-names-from-xlsx'),

  // You can expose other APTs you need here.
  // ...
})
