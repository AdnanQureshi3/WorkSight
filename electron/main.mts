import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { 
  getAppUsage, 
  updateUserProfile, 
  getUserProfile, 
  getGoals, 
  addGoal, 
  deleteGoal,
  getWeeklyHistory, 

  getWeekSummary,
  getMonthSummary
} from "./db.js"; 
import { runPythonAI } from "./pythonRunner.js";

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

/* ---------- TRACKER CONTROL ---------- */

ipcMain.on("start-tracking", () => {
  if (trackerProcess) return;
  
  const parentDir = path.resolve(__dirname, "..");
  const pythonPath = path.join(parentDir, "../python/venv/Scripts/python.exe");
  const scriptPath = path.join(parentDir, "../python/tracker.py");

  trackerProcess = spawn(pythonPath, [scriptPath], { windowsHide: true });

  trackerProcess.on("error", (err: Error) => console.error("Spawn error:", err));
});

ipcMain.on("stop-tracking", () => {
  if (!trackerProcess) return;
  trackerProcess.kill();
  trackerProcess = null;
});

/* ---------- ANALYTICS HANDLERS ---------- */

ipcMain.handle("get-day-app-usage", (_, date: string) => getAppUsage(date));

ipcMain.handle("get-week-summary", (_, startDate: string, endDate: string) => 
  getWeekSummary(startDate, endDate)
);

ipcMain.handle("get-month-summary", (_, year: number, month: number) => 
  getMonthSummary(year, month)
);

ipcMain.handle("getWeeklyHistory", () => getWeeklyHistory());


/* ---------- USER PROFILE ---------- */

ipcMain.handle("update-user-profile", (_, profileData: any) => updateUserProfile(profileData));

ipcMain.handle("get-user-profile", () => getUserProfile());

/* ---------- GOALS ---------- */

ipcMain.handle("get-goals", () => getGoals());

ipcMain.handle("add-goal", (_, goal) => addGoal(goal));

ipcMain.handle("delete-goal", (_, id: number) => deleteGoal(id));

/* ---------- AI PROCESSING ---------- */

ipcMain.handle("get-data", async () => {
  const today = new Date().toISOString().split('T')[0];
  // Using getAppUsage as the clean source for AI data
  const data = getAppUsage(today);
  
  const aiResult = await runPythonAI(data);
  return aiResult;
});