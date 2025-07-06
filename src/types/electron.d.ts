export interface ElectronStore {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
}

export interface ElectronAPI {
  getData: (key: string) => Promise<any>;
  saveData: (key: string, data: any) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electronStore?: ElectronStore;
  }
}