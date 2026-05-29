import BbqGuidePage from '../../src/views/BbqGuidePage.jsx'

export const metadata = {
  title: 'Types de BBQ — Offset, Kettle, Pellet, Kamado',
  description: "Guide complet des différents types de barbecues et fumoirs pour choisir celui qui correspond à votre style.",
}

export const dynamic = 'force-dynamic'

export default function BbqPage() {
  return <BbqGuidePage />
}
