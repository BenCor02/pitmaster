/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  transpilePackages: ['recharts'],
  webpack: (config) => {
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
