export interface IElectronAPI {
  // fire-and-forget (send/on)
  startTracking: () => void;
  stopTracking: () => void;

  // request-response (invoke/handle)
  getDailySummary: (date: string) => Promise<any[]>;
  getWeekSummary: (startDate: string, endDate: string) => Promise<any[]>;
  getCategoryBreakdown: (startDate: string, endDate: string) => Promise<any[]>;
  getDayAppUsage: (date: string) => Promise<any[]>;

  updateUserProfile: (profileData: any) => Promise<any>;
  getUserProfile: () => Promise<any>;
  getGoals: () => Promise<any[]>;
  addGoal: (goal: { name: string; target_minutes: number; threshold_percent: number }) => Promise<any>;
  updateGoalProgress: (id: number, current: number) => Promise<any>;
  deleteGoal: (id: number) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
