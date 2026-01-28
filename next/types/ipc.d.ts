export interface IElectronAPI {
  // Tracker Control
  startTracking: () => void;
  stopTracking: () => void;

  // Analytics
  getDayAppUsage: (date: string) => Promise<any>;
  getWeekSummary: (startDate: string, endDate: string) => Promise<any[]>;
  getMonthSummary: (year: number, month: number) => Promise<any[]>;
  getWeeklyHistory: () => Promise<any[]>;
  
  // User Profile
  updateUserProfile: (profileData: any) => Promise<any>;
  getUserProfile: () => Promise<any>;

  // Goals
  getGoals: () => Promise<any[]>;
  addGoal: (goal: { 
    name: string; 
    target_minutes: number; 
    threshold_percent: number 
  }) => Promise<any>;
  deleteGoal: (id: number) => Promise<any>;

  // AI Processing
  getData: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}