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
    <div className="min-h-screen">
      {/* Hero with image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1400&h=400&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/20" />
        </div>
        <div className="relative px-6 lg:px-10 py-12 lg:py-16 max-w-5xl">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Guides Pitmaster
            </div>
            <h1 className="font-display text-[30px] lg:text-[40px] font-black text-white tracking-tight leading-[1.1] mb-3">
              Guides BBQ & <span className="text-gradient">Fumage.</span>
            </h1>
            <p className="text-[14px] lg:text-[16px] text-zinc-400 max-w-lg leading-relaxed">
              Tout ce qu'il faut savoir pour maîtriser la cuisson au fumoir. Des techniques aux astuces terrain.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-5xl">

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
    </div>
  )
}
