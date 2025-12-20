import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { spawn } from "child_process";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { getDailyCategorySummary, getAppUsage, getYouTubeBreakdown } from "./db.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const parentDir = path.resolve(__dirname, "..");
  // const parentDir = path.dirname(__dirname); //both work and gives same result

  const pythonPath = path.join(
    parentDir,
    "../python/venv/Scripts/python.exe"
  );

  const scriptPath = path.join(parentDir, "../python/tracker.py");
  console.log("python Path:", pythonPath);
  console.log("Starting tracker with script:", scriptPath);

  trackerProcess = spawn(pythonPath, [scriptPath], {
  windowsHide: true
});

trackerProcess.on("error", (err:Error) => {
  console.error("Spawn error:", err);
});

  return "Tracking started";
});

// STOP tracking
ipcMain.handle("stop-tracking", () => {
  if (!trackerProcess) return "Not running";
  trackerProcess.kill();
  trackerProcess = null;
  return "Tracking stopped";
});



//get daily summary
ipcMain.handle("get-daily-summary", (event, date: string) => {
  // const dat = "2025-12-18";
  console.log("Fetching daily summary for date:", date);
  const result = getDailyCategorySummary(date);
  console.log("Daily summary result:", result);
  return result;
   
});

//get app usage
ipcMain.handle("get-app-usage", (event, date: string) => {
  console.log("Fetching app usage for date:", date);
  return  getAppUsage(date);
});

//get YouTube breakdown
ipcMain.handle("get-youtube-breakdown", (event, date: string) => {
  console.log("Fetching YouTube breakdown for date:", date);
 return   getYouTubeBreakdown(date);
});