const { ipcRenderer } = require('electron')

global.cloud = {};
global.cloud.invoke = (settings) => {
    if (!settings.hasOwnProperty('service')) {
        throw Error('"service" prop not found in settings');
    }
    return ipcRenderer.invoke('__COP_cloud_invoke', settings);
}

// FIXME: only if debug mode
global.cloud.invoke({service: 'debug', data: {mode: 'detach'}});