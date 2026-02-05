import { contextBridge, ipcRenderer } from "electron";
import { getWeekSummary } from "./db";

console.log("preload: exposing electronAPI (includes aiQuery if present)");

contextBridge.exposeInMainWorld("electronAPI", {
  // -------- READ (dashboard data) --------
  getDaySummary: (date: string) =>
    ipcRenderer.invoke("get-day-summary", date),

  getWeekSummary: (startDate: string, endDate: string) =>
    ipcRenderer.invoke("get-week-summary", startDate, endDate),


  getDayAppUsage: (date: string) =>
    ipcRenderer.invoke("getDayAppUsage", date),


  // -------- USER PROFILE --------
  getUserProfile: () =>
    ipcRenderer.invoke("get-user-profile"),

  updateUserProfile: (profileData: any) =>
    ipcRenderer.invoke("update-user-profile", profileData),

  // -------- TRACKING --------
  startTracking: () =>
    ipcRenderer.send("start-tracking"),

  stopTracking: () =>
    ipcRenderer.send("stop-tracking"),
  

  // -------- AI QUERY (natural language → SQL → analyze) --------
  aiQuery: (messages: any[]) => ipcRenderer.invoke("ai-query", messages),



  // -------- GOALS --------

  
});

