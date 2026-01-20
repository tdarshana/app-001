import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quizspark.app',
  appName: 'QuizSpark',
  webDir: 'build',
  server: {
    androidScheme: 'https'
    // For development with live reload, uncomment:
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7c3aed',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#7c3aed'
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
