import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { spawn } from "child_process";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { getDailyCategorySummary, getAppUsage, getYouTubeBreakdown,
   updateUserProfile, getUserProfile, getGoals, addGoal,  deleteGoal,
   getWeeklyHistory, getWeeklyStats , getDailyGroupedUsage } from "./db.js"; 


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

// START tracking
ipcMain.on("start-tracking", () => {
  console.log("Start tracking requested");
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
ipcMain.on("stop-tracking", () => {
  if (!trackerProcess) return "Not running";
  trackerProcess.kill();
  trackerProcess = null;
  return "Tracking stopped";
});


ipcMain.handle("get-day-summary", (event, date: string) => {
  console.log("Getting day summary for date:", date);
  return getDailyCategorySummary(date);
});
ipcMain.handle("get-week-summary", (event, startDate: string, endDate: string) => {
  console.log("Getting week summary from", startDate, "to", endDate);
  // Implement week summary retrieval logic here
});
ipcMain.handle("get-category-breakdown", (event, startDate: string, endDate: string) => {
  console.log("Getting category breakdown from", startDate, "to", endDate);
  // Implement category breakdown retrieval logic here
});
ipcMain.handle("get-day-app-usage", (event, date: string) => {
  console.log("Getting day app usage for date:", date);
  return getAppUsage(date);
} );


//user functions
ipcMain.handle("update-user-profile", (event, profileData: any) => { 
  console.log("Updating user profile with data:", profileData);  
  updateUserProfile(profileData);
});
ipcMain.handle("get-user-profile", (event) => { 
  console.log("Getting user profile");
  return getUserProfile();
});


//Goal func
ipcMain.handle("get-goals", () => {
  return getGoals();
});

ipcMain.handle("add-goal", (_, goal) => {
  return addGoal(goal);
});

// ipcMain.handle("update-goal-progress", (_, id, current) => {
//   return updateGoalProgress(id, current);
// });

ipcMain.handle("delete-goal", (_, id) => {
  return deleteGoal(id);
});


ipcMain.handle("getWeeklyHistory", () => {
  return getWeeklyHistory();
});
ipcMain.handle("getWeeklyStats", () => {
  return getWeeklyStats();
});


ipcMain.handle("get-data", async () => {
  console.log("Getting data for AI processing");
  const today = new Date().toISOString().split('T')[0];
  const data = getDailyGroupedUsage(today);

  const aiResult = await runPythonAI(data);
  // 3. Return to UI
  return aiResult;


});