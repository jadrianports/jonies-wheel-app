// @ts-ignore
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
//import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import * as XLSX from 'xlsx'

//const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    // Set zoom to default after page loads
    win?.webContents.setZoomFactor(1.0)
    win?.webContents.setZoomLevel(0)
  })

  // Prevent zoom shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && (input.key === '=' || input.key === '+' || input.key === '-' || input.key === '0')) {
      event.preventDefault()
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Listen for fullscreen state changes and notify renderer
  win.on('enter-full-screen', () => {
    win?.webContents.send('fullscreen-changed', true)
  })
  win.on('leave-full-screen', () => {
    win?.webContents.send('fullscreen-changed', false)
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// Handle fullscreen toggle
ipcMain.on('toggle-fullscreen', () => {
  if (!win) return
  const isFullScreen = win.isFullScreen()
  win.setFullScreen(!isFullScreen)
})

// Handle close app
ipcMain.on('close-app', () => {
  app.quit()
})

// Handle saving app data
ipcMain.handle('save-app-data', async (_event, data) => {
  try {
    const userDataPath = app.getPath('userData')
    const filePath = path.join(userDataPath, 'wheel-app-data.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return { success: true }
  } catch (error) {
    console.error('Failed to save app data:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Handle loading app data
ipcMain.handle('load-app-data', async () => {
  try {
    const userDataPath = app.getPath('userData')
    const filePath = path.join(userDataPath, 'wheel-app-data.json')
    const data = fs.readFileSync(filePath, 'utf8')
    return { success: true, data: JSON.parse(data) }
  } catch (error) {
    // If file doesn't exist or error, return default data
    console.log('No saved data found, using defaults')
    return {
      success: true,
      data: {
        namesText: 'Ali\nBeatriz\nDiya\nEric\nFatima\nGabriel\nGeorge\nHanna',
        results: []
      }
    }
  }
})

// Handle importing names from xlsx file
ipcMain.handle('import-names-from-xlsx', async () => {
  try {
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: [
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'No file selected' }
    }

    const filePath = result.filePaths[0]
    const fileBuffer = fs.readFileSync(filePath)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // Find column with "Complete Name" or "Full Name"
    let nameColumnIndex = -1
    const headers = jsonData[0] as string[]
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toLowerCase()
      if (header === 'complete name' || header === 'full name') {
        nameColumnIndex = i
        break
      }
    }

    if (nameColumnIndex === -1) {
      return { success: false, error: 'No "Complete Name" or "Full Name" column found' }
    }

    // Extract names from the column, skipping header
    const names: string[] = []
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      const name = row[nameColumnIndex]?.toString().trim()
      if (name) {
        const formattedName = name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
        names.push(formattedName)
      }
    }

    return { success: true, names }
  } catch (error) {
    console.error('Failed to import names from xlsx:', error)
    return { success: false, error: (error as Error).message }
  }
})
