import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadURL("http://localhost:3000");
}

ipcMain.on("nextjs-to-electron", (event, msg) => {
  console.log("FROM NEXT:", msg);
  event.sender.send("electron-to-nextjs", "Hello from Electron");
});

app.whenReady().then(createWindow);
