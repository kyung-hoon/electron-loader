let Electron = require('electron');
if (Electron) {
  //Electron.remote.getCurrentWebContents().openDevTools();
}

const mapNumbers = require('electron').remote.require('./index')

const withRendererCb = mapNumbers.withRendererCallback(x => x + 1)
const withLocalCb = mapNumbers.withLocalCallback()

console.log(withRendererCb, withLocalCb)

const dialog = require('electron').remote.require('./app/dialog')
dialog.a1('Error message Test', 'Test!!!!! ' + withLocalCb +' ' + withRendererCb)
