import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel: "nextjs-to-electron", data: { message: string }) => {
    ipcRenderer.send(channel, data);
  },

  receive: (
    channel: "electron-to-nextjs",
    func: (message: string) => void
  ) => {
    ipcRenderer.on(channel, (_event, message: string) => {
      func(message);
    });
  },

  openFile: () => ipcRenderer.invoke("dialog:openFile"),
});
