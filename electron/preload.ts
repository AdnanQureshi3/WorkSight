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
  
  getData:()=>
    ipcRenderer.invoke("get-data"),


  // -------- GOALS --------
  getGoals: () => ipcRenderer.invoke("get-goals"),

  addGoal: (goal: {
    name: string;
    targetMinutes: number;
    thresholdPercent: number;
  }) => ipcRenderer.invoke("add-goal", goal),

  updateGoalProgress: (id: number, current: number) =>
    ipcRenderer.invoke("update-goal-progress", id, current),

  deleteGoal: (id: number) =>
    ipcRenderer.invoke("delete-goal", id),

   getWeeklyHistory: () => ipcRenderer.invoke("getWeeklyHistory"),
   getWeeklyStats: () => ipcRenderer.invoke("getWeeklyStats"),
});

