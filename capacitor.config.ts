import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fr.charbonetflamme.app',
  appName: 'Charbon & Flamme',
  webDir: 'dist',
  server: {
    // En dev, charger depuis le serveur Vite local
    // url: 'http://10.0.2.2:5173', // décommenter pour dev Android emulator
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_flame',
      iconColor: '#ff6b1a',
    },
  },
}

export default config
