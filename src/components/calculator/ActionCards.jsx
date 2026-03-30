import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../modules/auth/AuthContext.jsx'
import { journal } from '../../lib/journal.js'
import { createSharedCook } from '../../lib/sharedCooks.js'

// ── Compact Action Bar (replaces 3 separate CTAs) ──────

export function ActionBar({ result }) {
  const { isAuthenticated, session, profile } = useAuth()
  const navigate = useNavigate()
  const [shareUrl, setShareUrl] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = () => {
    const prefill = journal.fromCalculatorResult(result)
    const encoded = encodeURIComponent(JSON.stringify(prefill))
    navigate(`/journal?prefill=${encoded}`)
  }

  const handleLive = () => {
    navigate('/live', { state: { profileId: result.profileId, weightKg: result.weightKg, cookTempC: result.cookTempC, wrapped: result.wrapped } })
  }

  const handleShare = async () => {
    if (!session?.user?.id) return
    setSharing(true)
    const shared = await createSharedCook(session.user.id, {
      meat_name: result.profile,
      weight_kg: result.weightKg,
      cook_temp_c: result.cookTempC,
      wrapped: result.wrapped,
      doneness: result.doneness,
      total_estimate: result.totalEstimate,
      cook_minutes: result.cookMinutes,
      rest_estimate: result.restEstimate,
      phases: result.phases,
      tips: result.tips,
      user_display_name: profile?.display_name || 'Un pitmaster',
    })
    if (shared) {
      setShareUrl(`${window.location.origin}/partage/${shared.share_code}`)
    }
    setSharing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // If share link is ready, show it
  if (shareUrl) {
    return (
      <div className="surface p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔗</span>
          <p className="text-[12px] text-zinc-400 flex-1">Lien prêt !</p>
          <button onClick={handleCopy} className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${copied ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/[0.05] border-white/[0.08] text-zinc-300 hover:text-white'}`}>
            {copied ? '✓ Copié' : 'Copier'}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Je planifie ${result.profile} ${result.weightKg}kg sur @CharbonFlamme !`)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-bold hover:bg-sky-500/20 transition-all"
          >
            𝕏
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="surface p-3">
      <div className="flex items-center gap-2">

        {/* Live cook */}
        <button onClick={handleLive} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-r from-green-600/15 to-emerald-600/10 border border-green-500/15 text-green-400 hover:border-green-500/25 transition-all">
          <span className="text-sm">🌡️</span>
          <span className="text-[12px] font-bold">Live</span>
        </button>

        {/* Save */}
        {isAuthenticated ? (
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-[#ff6b1a]/8 border border-[#ff6b1a]/15 text-[#ff6b1a] hover:border-[#ff6b1a]/25 transition-all">
            <span className="text-sm">📓</span>
            <span className="text-[12px] font-bold">Sauver</span>
          </button>
        ) : (
          <Link to="/login" state={{ from: '/' }} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-[#ff6b1a]/8 border border-[#ff6b1a]/15 text-[#ff6b1a] hover:border-[#ff6b1a]/25 transition-all">
            <span className="text-sm">📓</span>
            <span className="text-[12px] font-bold">Sauver</span>
          </Link>
        )}

        {/* Share */}
        {isAuthenticated ? (
          <button onClick={handleShare} disabled={sharing} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-sky-500/8 border border-sky-500/15 text-sky-400 hover:border-sky-500/25 transition-all">
            <span className="text-sm">🔗</span>
            <span className="text-[12px] font-bold">{sharing ? '...' : 'Partager'}</span>
          </button>
        ) : (
          <Link to="/login" state={{ from: '/' }} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-sky-500/8 border border-sky-500/15 text-sky-400 hover:border-sky-500/25 transition-all">
            <span className="text-sm">🔗</span>
            <span className="text-[12px] font-bold">Partager</span>
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Rub Section (collapsible) ──────────────────────────

export function RubSection({ rubs, meatName }) {
  const [expanded, setExpanded] = useState(false)
  const [showRecipes, setShowRecipes] = useState(false)

  if (!rubs || rubs.length === 0) return null

  return (
    <div className="surface overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff6b1a]/20 to-red-500/10 flex items-center justify-center shrink-0">
          <span className="text-xs">🧂</span>
        </div>
        <span className="text-[13px] font-bold text-white flex-1">Rubs suggérés</span>
        <span className="text-[10px] font-semibold text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-md">{rubs.length} recettes</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-zinc-600 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rubs.map((rub, i) => (
              <div key={i} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-[12px] font-semibold text-white leading-tight">{rub.name}</p>
                  {rub.badge && (
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                      rub.badge === 'Classique' ? 'bg-[#ff6b1a]/10 text-[#ff6b1a]' :
                      rub.badge === 'FR' ? 'bg-blue-500/10 text-blue-400' :
                      rub.badge === 'Compétition' ? 'bg-purple-500/10 text-purple-400' :
                      rub.badge === 'Premium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-white/[0.06] text-zinc-400'
                    }`}>{rub.badge}</span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-600 mb-1">{rub.origin}</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{rub.ingredients}</p>
                {showRecipes && (
                  <div className="mt-2 pt-2 border-t border-white/[0.04] animate-fade">
                    <p className="text-[10px] text-zinc-500"><span className="font-semibold text-zinc-400">Conseil :</span> {rub.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setShowRecipes(!showRecipes)} className="mt-2 text-[11px] font-medium text-[#ff6b1a]/70 hover:text-[#ff6b1a] transition-colors">
            {showRecipes ? '← Moins de détails' : 'Voir les conseils →'}
          </button>
        </div>
      )}
    </div>
  )
}
