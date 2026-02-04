import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { spawn } from "child_process";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

import { exec } from "child_process";

import { getDailyCategorySummary, getDayAppUsage,
   updateUserProfile, getUserProfile, 
   getWeeklyHistory, getWeeklyStats , getDailyGroupedUsage, runSafeSQL, getuserGoal } from "./db.js"; 


   import { runPythonAI } from "./pythonRunner.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow;
let trackerProcess: any = null;
// const trackerExe = path.join(
//   process.resourcesPath,
//   "worksight-tracker.exe"
// );
const trackerExe = app.isPackaged
  ? path.join(process.resourcesPath, "worksight-tracker.exe")
  : path.join(__dirname, "../resources/worksight-tracker.exe");

app.setLoginItemSettings({
  openAtLogin: true,
  path: trackerExe,
});

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:3000");
  if(!trackerProcess){
    trackerProcess = exec(`"${trackerExe}"`);

  }
 

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

ipcMain.handle("getDayAppUsage", (event, date: string) => {
  // console.log("Getting day app usage for date:", date);
  return getDayAppUsage(date);
} );


//user functions
ipcMain.handle("update-user-profile", (event, profileData: any) => { 
  console.log("Updating user profile with data:", profileData);  
  updateUserProfile(profileData);
});
ipcMain.handle("get-user-profile", (event) => { 
  // console.log("Getting user profile");
  return getUserProfile();
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

// AI NATURAL-LANGUAGE → SQL → ANALYZE PIPELINE 
ipcMain.handle("ai-query", async (event, messages: any[]) => {
  let user = getUserProfile();
  console.log("user is :", user);

  const user_query = messages[messages.length - 1].content;
  console.log("AI Query received:", user_query); 

  // 1) Ask Python to generate a SQL query from the natural language prompt
  let gen;
  try {
    gen = await runPythonAI({ type: "generate_sql", messages , user_query, user });
  } catch (err: any) {
    console.error("AI generation error:", err);
    return { status: "error", error: "AI generation failed", detail: String(err) };
  }

  if (!gen || gen.status !== "ok" ) {
    return { status: "error", error: "AI failed to generate a SQL query", detail: gen };
  }
  
  if(gen.sql_generated === "no"){
    return { status: "ok", sql: "", analysis: { analysis: gen.reply } };
  }

  // 2) Run the SQL safely on the local DB
  console.log("Generated SQL:", gen.sql);
  let rows;
  try {
    rows = runSafeSQL(gen.sql);
  }
  catch (err: any) {
    console.error("SQL execution error:", err.message);
    return { status: "error", error: "SQL execution failed", detail: err.message, sql: gen.sql };
  }

  // 3) Send results back to the AI for analysis / natural language summary

;

  let analysis;
  try {
    analysis = await runPythonAI({ type: "analyze", messages,rows,user, user_query });
  } catch (err: any) {
    console.error("AI analysis error:", err);
    analysis = { status: "error", error: String(err) };
  }

  // 4) Return to the UI
  return { status: "ok", sql: gen.sql,  analysis };
});