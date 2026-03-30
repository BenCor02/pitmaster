import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchGuideBySlug, fetchGuides } from '../lib/cms.js'
import { renderMarkdown } from '../lib/markdown.js'
import { updateMeta, articleSchema, injectJsonLd } from '../lib/seo.js'
import GuideCard from '../components/content/GuideCard.jsx'

export default function GuidePage() {
  const { slug } = useParams()
  const [guide, setGuide] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setNotFound(false)

      const data = await fetchGuideBySlug(slug)
      if (cancelled) return

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setGuide(data)

      // SEO
      updateMeta({
        title: data.seo_title || data.title,
        description: data.seo_description || data.summary,
        canonical: `https://charbonetflamme.fr/guides/${data.slug}`,
      })
      injectJsonLd('article-schema', articleSchema(data))

      // Related guides
      const all = await fetchGuides({ meatType: data.meat_type, limit: 4 })
      if (!cancelled) {
        setRelated(all.filter(g => g.id !== data.id).slice(0, 2))
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
      injectJsonLd('article-schema', null)
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">📚</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Chargement du guide...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[48px] font-bold text-zinc-800 mb-2">404</p>
          <p className="text-zinc-500 text-[14px] mb-6">Ce guide n'existe pas ou n'est plus disponible.</p>
          <Link to="/guides" className="btn-primary px-6 py-2.5 text-[13px]">Voir tous les guides</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {guide.cover_url && (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img src={guide.cover_url} alt={guide.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        </div>
      )}

      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-zinc-600 mb-6">
          <Link to="/" className="hover:text-zinc-400 transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/guides" className="hover:text-zinc-400 transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-zinc-400">{guide.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {guide.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b1a]/70 mb-2 block">
              {guide.category}
            </span>
          )}
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight mb-3">
            {guide.title}
          </h1>
          {guide.summary && (
            <p className="text-[15px] text-zinc-400 leading-relaxed max-w-xl">{guide.summary}</p>
          )}
          {guide.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {guide.tags.map(tag => (
                <span key={tag} className="text-[10px] font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <article
          className="prose-cf"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.content) }}
        />

        {/* CTA retour calculateur */}
        <div className="mt-10 surface p-6 text-center">
          <p className="text-[14px] text-zinc-400 mb-3">Prêt à planifier ta cuisson ?</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-[13px]">
            <span>🔥</span>
            Lancer le calculateur
          </Link>
        </div>

        {/* Related guides */}
        {related.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-[16px] font-bold text-white">Guides complémentaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map(g => <GuideCard key={g.id} guide={g} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
