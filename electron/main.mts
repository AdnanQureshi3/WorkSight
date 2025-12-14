import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { spawn } from "child_process";
import Database from "better-sqlite3";

let win: BrowserWindow;
let trackerProcess: any = null;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:3000");
});

// START tracking
ipcMain.handle("start-tracking", () => {
  if (trackerProcess) return "Already running";

  const pythonPath = path.join(
    __dirname,
    "../python/.venv/Scripts/python.exe"
  );

  const scriptPath = path.join(__dirname, "../python/tracker.py");

  trackerProcess = spawn(pythonPath, [scriptPath]);
  return "Tracking started";
});

// STOP tracking
ipcMain.handle("stop-tracking", () => {
  if (!trackerProcess) return "Not running";
  trackerProcess.kill();
  trackerProcess = null;
  return "Tracking stopped";
});

// READ data
ipcMain.handle("get-data", () => {
  const db = new Database(
    path.join(__dirname, "../database/worksight.db")
  );

  const rows = db
    .prepare("SELECT * FROM activity ORDER BY id DESC LIMIT 10")
    .all();

  db.close();
  return rows;
});
