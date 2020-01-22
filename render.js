// const { ipcRenderer } = require('electron')

onload = () => {
  const webview = document.getElementById('mainWebView')
  
  var initialized = false
  webview.addEventListener('load-commit', (event) => {
    if (!initialized) {
      console.log(event) // FIXME: url check

      //webview.loadURL("https://www.tmaxcloudspace.com/")
      webview.openDevTools()
      initialized = true
    }
  })
  webview.addEventListener('dom-ready', () => {
    // webview.executeJavaScript(`
    // __COP_LocalService_binding({service: 'abc'})
    // `)
  })
}