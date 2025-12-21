import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // -------- READ (dashboard data) --------
  getDaySummary: (date: string) =>
    ipcRenderer.invoke("get-day-summary", date),

  getWeekSummary: (startDate: string, endDate: string) =>
    ipcRenderer.invoke("get-week-summary", startDate, endDate),

  getCategoryBreakdown: (startDate: string, endDate: string) =>
    ipcRenderer.invoke("get-category-breakdown", startDate, endDate),

  getDayAppUsage: (date: string) =>
    ipcRenderer.invoke("get-day-app-usage", date),

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
});
