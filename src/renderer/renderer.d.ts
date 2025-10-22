export interface IElectronAPI {}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
