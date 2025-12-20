import { contextBridge, ipcRenderer } from "electron";


contextBridge.exposeInMainWorld("electronAPI", {
  startTracking: () => ipcRenderer.invoke("start-tracking"),
  stopTracking: () => ipcRenderer.invoke("stop-tracking"),
  getData: () => ipcRenderer.invoke("get-data"),
  getDailySummary: (date:String) => ipcRenderer.invoke("get-daily-summary" , date),
});
