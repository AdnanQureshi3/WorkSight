import { contextBridge, ipcRenderer } from "electron";

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
  
  getData:()=>
    ipcRenderer.invoke("get-data"),

  // -------- AI QUERY (natural language → SQL → analyze) --------
  aiQuery: (prompt: string) => ipcRenderer.invoke("ai-query", prompt),



  // -------- GOALS --------

   getWeeklyHistory: () => ipcRenderer.invoke("getWeeklyHistory"),
   getWeeklyStats: () => ipcRenderer.invoke("getWeeklyStats"),
});

