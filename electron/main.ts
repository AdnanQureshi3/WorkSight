import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import path from "path";

// Fix for __dirname in ESM mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.join(__dirname, "../next/out/index.html"));
  }
}

app.whenReady().then(createWindow);
