// types/ipc.d.ts

// The interface for the API exposed on the window object (used by Next.js)
export interface IElectronAPI {
  /**
   * Sends a message to the Main Process (one-way).
   * @param channel - 'nextjs-to-electron'
   * @param data - The data payload (an object with a message string).
   */
  send: (channel: 'nextjs-to-electron', data: { message: string }) => void;

  /**
   * Listens for messages from the Main Process.
   * @param channel - 'electron-to-nextjs'
   * @param func - The callback function to run when a message is received.
   */
  receive: (channel: 'electron-to-nextjs', func: (message: string) => void) => void;

  /**
   * Sends a request and waits for a reply from the Main Process (two-way).
   * Maps to ipcMain.handle('dialog:openFile').
   * @returns A promise that resolves with the selected file path.
   */
  openFile: () => Promise<string | undefined>;
}

// Augment the global Window object to include your new API.
// This allows Next.js TypeScript files to use window.electronAPI without errors.
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}