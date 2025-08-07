/// <reference types="vite/client" />

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      platform: string;
    };
  }
}
