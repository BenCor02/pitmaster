import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSharedCook } from '../lib/sharedCooks.js'

export default function SharedCookPage() {
  const { code } = useParams()
  const [cook, setCook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSharedCook(code).then(data => { setCook(data); setLoading(false) })
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-zinc-500 text-sm">Chargement du plan...</p>
        </div>
      </div>
    )
  }

  if (!cook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">😕</span>
          <p className="text-zinc-400 text-[15px] mb-4">Ce lien de partage n'existe pas ou a expiré</p>
          <Link to="/calculateur" className="btn-primary px-5 py-2.5 text-[13px]">Retour au calculateur</Link>
        </div>
      </div>
    )
  }

  const phases = typeof cook.phases === 'string' ? JSON.parse(cook.phases) : cook.phases
  const tips = typeof cook.tips === 'string' ? JSON.parse(cook.tips) : cook.tips
  const shareUrl = window.location.href

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b1a]/[0.08] via-transparent to-[#ef4444]/[0.04]" />
        <div className="relative px-6 lg:px-10 py-10 lg:py-14 max-w-4xl">
          <div className="animate-fade-up">
            {cook.user_display_name && (
              <p className="text-[12px] text-zinc-500 mb-3">
                Partagé par <span className="text-[#ff6b1a] font-bold">{cook.user_display_name}</span>
              </p>
            )}
            <h1 className="text-[26px] lg:text-[34px] font-extrabold text-white tracking-tight leading-[1.1] mb-3">
              {cook.meat_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-zinc-400">
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] font-medium">
                {cook.weight_kg} kg
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] font-medium">
                {cook.cook_temp_c}°C
              </span>
              {cook.wrapped && (
                <span className="px-3 py-1.5 rounded-lg bg-[#ff6b1a]/10 border border-[#ff6b1a]/20 text-[#ff6b1a] font-medium">
                  Wrapped
                </span>
              )}
              {cook.rub_name && (
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                  🧂 {cook.rub_name}
                </span>
              )}
            </div>

            {/* Estimation totale */}
            <div className="mt-6 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#ff6b1a]/[0.08] to-[#ef4444]/[0.04] border border-[#ff6b1a]/[0.15]">
              <p className="text-[11px] text-[#ff6b1a]/70 font-bold uppercase tracking-wider mb-1">Durée totale estimée</p>
              <p className="text-[22px] font-extrabold text-white">{cook.total_estimate}</p>
              {cook.rest_estimate && (
                <p className="text-[12px] text-zinc-500 mt-1">dont repos : {cook.rest_estimate}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-4xl">
        {/* Phases */}
        {phases?.length > 0 && (
          <div className="space-y-3 mb-8">
            <h2 className="text-[14px] font-bold text-white flex items-center gap-2 mb-4">
              <span>📋</span> Phases de cuisson
            </h2>
            {phases.map((phase, idx) => (
              <div key={idx} className="surface p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center text-[12px] font-black text-white shrink-0">
                    {phase.num || idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-white">{phase.title}</h3>
                      {phase.duration && (
                        <span className="text-[11px] text-[#ff6b1a] font-bold">{phase.duration}</span>
                      )}
                    </div>
                    <p className="text-[12px] text-zinc-400 mb-2">{phase.objective}</p>
                    {phase.markers?.map((m, i) => (
                      <p key={i} className="text-[11px] text-zinc-500 flex items-center gap-1.5 mb-1">
                        <span className={m.type === 'temp' ? 'text-red-400' : m.type === 'visual' ? 'text-amber-400' : 'text-blue-400'}>
                          {m.type === 'temp' ? '🌡️' : m.type === 'visual' ? '👁️' : 'ℹ️'}
                        </span>
                        {m.text}
                      </p>
                    ))}
                    {phase.advice && (
                      <p className="text-[11px] text-zinc-600 mt-2 italic">💡 {phase.advice}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {tips?.length > 0 && (
          <div className="surface p-5 mb-8">
            <h2 className="text-[14px] font-bold text-white flex items-center gap-2 mb-3">
              <span>🎯</span> Conseils pitmaster
            </h2>
            <div className="space-y-2">
              {tips.map((tip, idx) => (
                <p key={idx} className="text-[12px] text-zinc-400 flex items-start gap-2">
                  <span className="text-[#ff6b1a] shrink-0 mt-0.5">•</span>
                  {tip}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div className="surface p-5">
          <h2 className="text-[14px] font-bold text-white flex items-center gap-2 mb-4">
            <span>🔗</span> Partager ce plan
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[12px] font-bold text-zinc-300 hover:text-white hover:border-white/[0.15] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copier le lien
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`J'ai planifié ma cuisson de ${cook.meat_name} (${cook.weight_kg}kg) sur Charbon & Flamme ! ${cook.total_estimate} de fumée`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[12px] font-bold text-sky-400 hover:bg-sky-500/20 transition-all"
            >
              𝕏 Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[12px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              Facebook
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Ma cuisson ${cook.meat_name} planifiée sur Charbon & Flamme : ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[12px] font-bold text-green-400 hover:bg-green-500/20 transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link to="/calculateur" className="btn-primary px-8 py-3 text-[14px] font-bold">
            Planifier ma propre cuisson
          </Link>
          <p className="text-[11px] text-zinc-600 mt-3">charbonetflamme.fr — L'arsenal du pitmaster</p>
        </div>
      </div>
    </div>
  )
}
