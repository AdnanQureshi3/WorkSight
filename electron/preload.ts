import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  message: "Hello from Preload!"
});
