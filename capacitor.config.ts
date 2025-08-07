import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gizli.app',
  appName: 'Gizli',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a19",
      showSpinner: true,
      spinnerColor: "#00ff88"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#0a0a19"
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
