import { Analytics } from '@vercel/analytics/react'
import Providers from './providers.jsx'
import '../src/index.css'

export const metadata = {
  title: {
    default: 'Charbon & Flamme — Le calculateur BBQ des pitmasters',
    template: '%s | Charbon & Flamme',
  },
  description: "Calculateur BBQ, guides techniques, recettes de rubs et marinades. Le média référence du barbecue en France.",
  metadataBase: new URL('https://charbonetflamme.fr'),
  openGraph: { siteName: 'Charbon & Flamme', locale: 'fr_FR', type: 'website' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Analytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
