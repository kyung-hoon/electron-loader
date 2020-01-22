const { app, ipcMain, session, BrowserWindow } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  const baseUserAgent = session.defaultSession.getUserAgent();
  session.defaultSession.setUserAgent(baseUserAgent + " CloudOpenPlatform/0.0.2");
  session.defaultSession.setPreloads([path.resolve(__dirname, 'binding.js')]);

  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false
    },
    show: false
  });

  win.once('ready-to-show', () => { win.show() })
  win.on('closed', () => { win = null })
  win.loadURL('https://www.tmaxcloudspace.com/')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
})

ipcMain.handle('__COP_cloud_invoke', (event, settings) => {
  return require('./services/' + settings.service)(event.sender, settings.data);
})