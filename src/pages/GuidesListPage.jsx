import { useState, useEffect } from 'react'
import { fetchGuides } from '../lib/cms.js'
import { updateMeta } from '../lib/seo.js'
import GuideCard from '../components/content/GuideCard.jsx'

export default function GuidesListPage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateMeta({
      title: 'Guides BBQ & Fumage',
      description: 'Guides pratiques pour maîtriser le barbecue low & slow, le reverse sear, le stall, le wrap et toutes les techniques de pitmaster.',
    })

    fetchGuides().then(data => {
      setGuides(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 lg:px-10 py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="badge badge-accent mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
          Guides Pitmaster
        </div>
        <h1 className="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight mb-2">
          Guides BBQ & Fumage
        </h1>
        <p className="text-[15px] text-zinc-400 max-w-lg leading-relaxed">
          Tout ce qu'il faut savoir pour maîtriser la cuisson au fumoir. Des techniques aux astuces terrain.
        </p>
      </header>

      {guides.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-600 text-[14px]">Aucun guide disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  )
}
