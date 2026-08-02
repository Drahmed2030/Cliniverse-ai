import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.cliniverse.ai',
  appName: 'Cliniverse AI',
  webDir: 'out',
  server: {
    url: 'https://cliniverse-ai-u7gi.vercel.app',
    cleartext: true
  }
}

export default config
