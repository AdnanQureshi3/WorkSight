export interface IElectronAPI {
  startTracking: () => Promise<string>;
  stopTracking: () => Promise<string>;
  getData: () => Promise<any[]>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
