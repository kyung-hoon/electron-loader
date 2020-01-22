module.exports = (webContents, data) => {
    webContents.openDevTools(data);
    return true;
}