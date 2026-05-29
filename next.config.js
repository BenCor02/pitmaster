/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  transpilePackages: ['recharts'],
  webpack: (config) => {
    // Stubber les modules Capacitor (app mobile) pour le build web
    const capacitorModules = [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/network',
      '@capacitor/preferences',
      '@capacitor/push-notifications',
      '@capacitor/splash-screen',
      '@capacitor/status-bar',
      '@capacitor/local-notifications',
      '@capacitor-community/bluetooth-le',
    ]
    capacitorModules.forEach(mod => {
      config.resolve.alias[mod] = false
    })
    return config
  },
}
export default nextConfig
