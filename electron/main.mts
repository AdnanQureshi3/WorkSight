import { app, BrowserWindow, ipcMain, protocol } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import updater from "electron-updater"
const { autoUpdater } = updater
import { exec } from "child_process";

import { getDayAppUsage,updateUserProfile, getUserProfile,  getWeekSummary,
   saveApiKeyForModel,db,ensureLLMKeys,} from "./db.js"; 
import {  AiQueryHandler } from "./func.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let win: BrowserWindow;
let trackerProcess: any = null;


  const trackerExe = app.isPackaged
  ? path.join(process.resourcesPath, "worksight-tracker.exe")
  : path.join(__dirname, "../../python/dist/worksight-tracker.exe");



app.setLoginItemSettings({
  openAtLogin: true,
  path: trackerExe,
});

app.whenReady().then(() => {

  win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, "../../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const uiPath = path.join(__dirname, "../../dist/index.html");
  win.loadFile(uiPath);

  if (!trackerProcess) {
    trackerProcess = exec(`"${trackerExe}"`);
  }

  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    win.webContents.send("update-status", "Checking for update...");
  });

  autoUpdater.on("update-available", () => {
    win.webContents.send("update-status", "Downloading update...");
  });

  autoUpdater.on("update-not-available", () => {
    win.webContents.send("update-status", "No update available.");
  });

  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update-status", "Installing update... Please wait.");

     setTimeout(() => {
    if (trackerProcess) {
      trackerProcess.kill();
    }

    autoUpdater.quitAndInstall(false, true);
  }, 2500);
  });

  autoUpdater.on("error", (err) => {
    win.webContents.send("update-status", "Update error: " + err.message);
  });

  autoUpdater.checkForUpdates();

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

ipcMain.handle("get-week-summary", (event, startDate: string, endDate: string) => { 
  console.log("Getting week summary from", startDate, "to", endDate);
  const data =  getWeekSummary(startDate, endDate);
  console.log("Week summary data retrieved:", data);
  return data;
});


ipcMain.handle("ai-query",(event , messages: any[], model: string, provider: string) => {
  
  const result = AiQueryHandler(messages, model, provider);

 return result; 
}
);


ipcMain.handle("save-api-key-for-model", (event, provider: string, model: string, apiKey: string) => { 
  console.log(`Saving API key for model ${model} from provider ${provider}`);
  saveApiKeyForModel(provider, model, apiKey);
});

ipcMain.handle("get-model-supported", (event) => { 
  ensureLLMKeys();
  console.log("Getting supported models");
  const stmt = db.prepare("SELECT provider, model, api_key FROM llm_api_keys");
  const rows = stmt.all();
  return rows;
}
);
