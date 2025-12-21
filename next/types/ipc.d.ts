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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
