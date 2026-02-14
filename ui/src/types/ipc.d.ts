export interface IElectronAPI {
  // fire-and-forget (send/on)
  startTracking: () => void;
  stopTracking: () => void;

  // request-response (invoke/handle)

  getDayAppUsage: (date: string) => Promise<any[]>;

  updateUserProfile: (profileData: any) => Promise<any>;
  getUserProfile: () => Promise<any>;
  getWeekSummary: (startDate: string, endDate: string) => Promise<any>;
  

  aiQuery: (messages: any[] , model: string, provider: string) => Promise<any>;


  // getChat: () => Promise<Message[]>;
  // setChat: (msgs: Message[]) => Promise<void>;
  // clearChat: () => Promise<void>;

  saveApiKeyForModel: (provider: string, model: string, apiKey: string) => Promise<void>;
  getModelSupported: () => Promise<{provider: string, model: string}[]>;
  onUpdateStatus: (callback: (message: string) => void) => void;

}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
