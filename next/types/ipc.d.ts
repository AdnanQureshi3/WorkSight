export interface IElectronAPI {
  startTracking: () => Promise<string>;
  stopTracking: () => Promise<string>;
  getData: () => Promise<any[]>;
  getDailySummary: (date: string) => Promise<any[]>;
  updateUserProfile: (profileData: any) => Promise<void>;
  getUserProfile: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
