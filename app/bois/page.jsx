import WoodGuidePage from '../../src/views/WoodGuidePage.jsx'

export const metadata = {
  title: 'Guide des Essences de Bois pour le Fumage BBQ',
  description: 'Chêne, hickory, pommier, cerisier... Découvrez quelle essence de bois choisir selon la viande.',
}

export const dynamic = 'force-dynamic'

export default function BoisPage() {
  return <WoodGuidePage />
}
