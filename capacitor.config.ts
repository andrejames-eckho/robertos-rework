import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stocktrack.app',
  appName: 'StockTrack',
  webDir: 'out',
  android: {
    // Enable hardware acceleration for better performance
    allowMixedContent: true,
    // Better WebView rendering
    webContentsDebuggingEnabled: true,
  },
  server: {
    // Allow clear text traffic for local development
    androidScheme: 'https',
    // Improve loading performance
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#0a0a0a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
