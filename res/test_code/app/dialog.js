const { dialog } = require('electron')

module.exports.a1 = function (data, data2) {
    console.log(data)
    //dialog.showOpenDialogSync(data)
    //dialog.showErrorBox(data.title,data.content);
    dialog.showErrorBox(data, data2)
    //dialog.showErrorBox('Oops! Something went wrong!', 'Help us improve your experience by sending an error report')
   
    return true;
}