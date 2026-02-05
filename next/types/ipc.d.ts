export interface IElectronAPI {
  // fire-and-forget (send/on)
  startTracking: () => void;
  stopTracking: () => void;

  // request-response (invoke/handle)

  getDayAppUsage: (date: string) => Promise<any[]>;

  updateUserProfile: (profileData: any) => Promise<any>;
  getUserProfile: () => Promise<any>;
  getWeekSummary: (startDate: string, endDate: string) => Promise<any>;
  

  aiQuery: (messages: any[]) => Promise<any>;


  // getChat: () => Promise<Message[]>;
  // setChat: (msgs: Message[]) => Promise<void>;
  // clearChat: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
