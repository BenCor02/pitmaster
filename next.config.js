/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
=======
  experimental: {
    // Needed for Sanity Studio in App Router
    serverComponentsExternalPackages: [],
  },
>>>>>>> b8014fe (feat: Sanity CMS — Studio /studio, schema articles, génération IA Claude)
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
