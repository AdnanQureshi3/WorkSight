import { app, BrowserWindow, ipcMain, protocol } from "electron";
import path from "path";
import { spawn } from "child_process";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

import { exec } from "child_process";

import { getDayAppUsage,updateUserProfile, getUserProfile, runSafeSQL, getWeekSummary,
   saveApiKeyForModel,db,ensureLLMKeys, getApiKeyForModel} from "./db.js"; 

import { runPythonAI } from "./pythonRunner.js";


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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

const uiPath = path.join(__dirname, "../../dist/index.html");
win.loadFile(uiPath);
  if(!trackerProcess){
    trackerProcess = exec(`"${trackerExe}"`);

  }
 

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

function classifyApiError(err: any): string {
  const msg = String(err).toLowerCase();

  if (msg.includes("invalid api key") || msg.includes("api key not valid"))
    return "Your API key is invalid. Please check and update it.";

  if (msg.includes("quota") || msg.includes("rate limit") || msg.includes("resource_exhausted"))
    return "Your API usage limit has been reached. Please try again later or upgrade your plan.";

  if (msg.includes("not_found") || msg.includes("model"))
    return "This model is not available for your API key.";

  return "Something went wrong while contacting the AI service.";
}


ipcMain.handle(
  "ai-query",
  async (event, messages: any[], model: string, provider: string) => {
    const user = getUserProfile();
    const user_query = messages[messages.length - 1]?.content ?? "";
    const api_key = getApiKeyForModel(provider);

    if (!api_key)
      return {
        status: "ok",
        sql: "",
        analysis: {
          analysis: `No API key found for ${provider}. Please add it in Profile → LLM Settings.`
        }
      };

    let gen, sql = "", analysis = { analysis: "" };

    // ---- SQL generation
    try {
      gen = await runPythonAI({
        type: "generate_sql",
        messages, user_query, user,
        model, provider, api_key
      });
    } catch (err) {
      console.error("SQL generation error:", err);
      return {
        status: "ok",
        sql: "",
        analysis: {
          analysis: classifyApiError(err)
        }
      };
    }

    if (!gen || gen.status !== "ok")
      return {
        status: "ok",
        sql: "",
        analysis: {
          analysis: "I couldn’t figure out what data you’re looking for."
        }
      };

    if (gen.sql_generated === "no")
      return {
        status: "ok",
        sql: "",
        analysis: { analysis: gen.reply || "" }
      };

    // ---- SQL execution + analysis
    try {
      sql = gen.sql;
      console.log("Generated SQL:", sql);
      const rows = runSafeSQL(sql);

      try {
        analysis = await runPythonAI({
          type: "analyze",
          messages, rows, user, user_query,
          model, provider, api_key
        });
      } catch (err) {
        console.error("Analysis error:", err);
        analysis = {
          analysis: classifyApiError(err)
        };
      }
    } catch (err) {
      console.error("Database error:", err);
      return {
        status: "ok",
        sql,
        analysis: {
          analysis: classifyApiError(err)
        }
      };
    }

    return { status: "ok", sql, analysis };
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
