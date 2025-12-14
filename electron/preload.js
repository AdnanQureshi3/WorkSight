"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    startTracking: () => electron_1.ipcRenderer.invoke("start-tracking"),
    stopTracking: () => electron_1.ipcRenderer.invoke("stop-tracking"),
    getData: () => electron_1.ipcRenderer.invoke("get-data"),
});
