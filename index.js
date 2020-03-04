const {app, BrowserWindow} = require('electron')

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  })

  win.loadFile('index.html') 
}

app.whenReady().then(createWindow)

// exports.withRendererCallback = (mapper) => {
//   return [1, 2, 3].map(mapper)
// }

// exports.withLocalCallback = () => {
//   return [1, 2, 3].map(x => x + 1)
// }