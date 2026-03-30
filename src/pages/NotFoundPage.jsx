import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#ff6b1a]/[0.05] rounded-full blur-3xl pointer-events-none animate-fire-breathe" />
      <div className="absolute -bottom-40 -right-40 w-60 h-60 bg-[#dc2626]/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-6 animate-fade-up">
        {/* Big 404 */}
        <div className="relative mb-6">
          <span className="text-[120px] lg:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/[0.06] to-transparent leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#dc2626] flex items-center justify-center shadow-2xl shadow-[#ff6b1a]/20 animate-pulse-glow">
              <span className="text-4xl">🔥</span>
            </div>
          </div>
        </div>

        <h1 className="text-[22px] lg:text-[28px] font-extrabold text-white tracking-tight mb-3">
          Cette page a <span className="text-gradient">brûlé.</span>
        </h1>

        <p className="text-[14px] text-zinc-500 max-w-sm mx-auto leading-relaxed mb-8">
          On dirait que le feu a été un peu trop fort par ici. La page que tu cherches n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary px-6 py-3 text-[14px] font-bold inline-flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Retour au calculateur
          </Link>
          <Link
            to="/recettes"
            className="px-6 py-3 rounded-xl text-[14px] font-bold text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all inline-flex items-center gap-2"
          >
            🧂 Explorer les recettes
          </Link>
        </div>

        {/* Fun fire quote */}
        <p className="text-[11px] text-zinc-700 mt-12 italic">
          "Si tu ne trouves pas la viande, retourne au feu." — Sagesse de pitmaster
        </p>
      </div>
    </div>
  )
}
