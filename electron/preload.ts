import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // -------- READ (dashboard data) --------
  getWeekSummary: (startDate: string, endDate: string) =>
    ipcRenderer.invoke("get-week-summary", startDate, endDate),

  getDayAppUsage: (date: string) =>
    ipcRenderer.invoke("get-day-app-usage", date),

  getMonthSummary: (year: number, month: number) =>
    ipcRenderer.invoke("get-month-summary", year, month),
  // -------- USER PROFILE --------
  updateUserProfile: (profileData: any) =>
    ipcRenderer.invoke("update-user-profile", profileData),
  getUserProfile: () => ipcRenderer.invoke("get-user-profile"),
  // -------- GOALS --------
  getGoals: (date: string) => ipcRenderer.invoke("get-goals", date),
  addGoal: (goal: any) => ipcRenderer.invoke("add-goal", goal), 
  updateGoalProgress: (id: number, current: number) =>
    ipcRenderer.invoke("update-goal-progress", id, current),
  deleteGoal: (id: number) => ipcRenderer.invoke("delete-goal", id),
  // -------- WEEKLY STATS & HISTORY --------
  getWeeklyHistory: () => ipcRenderer.invoke("getWeeklyHistory"),
  getWeeklyStats: () => ipcRenderer.invoke("getWeeklyStats"),

});

