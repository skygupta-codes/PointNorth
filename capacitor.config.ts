import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.truenorthpoints.app',
  appName: 'TrueNorthPoints',
  webDir: 'out',
  server: {
    url: 'https://truenorthpoints.ca',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    preferredContentMode: 'mobile',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      spinnerColor: '#f59e0b',
    },
  },
};

export default config;
