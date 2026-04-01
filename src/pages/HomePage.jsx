import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings.jsx'

export default function HomePage() {
  const { isModuleEnabled } = useSiteSettings()

  return (
    <div className="min-h-screen">

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1800&h=1000&fit=crop&q=90"
            alt=""
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080808] to-transparent" />
        </div>

        <div className="relative px-6 lg:px-12 pt-16 pb-20 lg:pt-24 lg:pb-28 max-w-4xl">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.07] backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ff6b1a] animate-pulse" />
              <span className="text-[11px] font-bold text-[#ff8c4a] uppercase tracking-[0.1em]">Gratuit &middot; Sans pub &middot; 100% terrain</span>
            </div>

            <h1 className="font-display text-[34px] sm:text-[44px] lg:text-[56px] font-black text-[#f5f0eb] tracking-tight leading-[1.05] mb-5">
              Ton assistant<br />
              <span className="text-gradient">fumoir & BBQ.</span>
            </h1>

            <p className="text-[16px] lg:text-[18px] text-stone-400 max-w-xl leading-relaxed mb-10">
              Que tu allumes ton premier offset ou que tu enchaînes les briskets depuis 10 ans, Charbon & Flamme te donne les repères pour réussir chaque cuisson. Temps, phases, wrap, repos — tout est là.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/calculateur"
                className="btn-primary inline-flex items-center gap-2.5 text-[15px] px-7 py-4"
              >
                <span className="text-lg">🔥</span>
                Planifier une cuisson
              </Link>
              {isModuleEnabled('recipes') && (
                <Link
                  to="/recettes"
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl text-[14px] font-semibold text-stone-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                >
                  <span className="text-lg">🧂</span>
                  Voir les recettes
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FEATURES ══════════ */}
      <div className="px-6 lg:px-12 py-16 max-w-5xl">
        <div className="mb-10">
          <p className="text-[11px] font-bold text-[#ff8c4a] uppercase tracking-[0.12em] mb-3">Ce que tu peux faire</p>
          <h2 className="font-display text-[24px] lg:text-[30px] font-black text-[#f5f0eb] tracking-tight leading-tight">
            Tout ce qu'il faut, <span className="text-gradient-static">rien de plus.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Calculateur */}
          <FeatureCard
            to="/calculateur"
            icon="🔥"
            title="Calculateur de cuisson"
            description="18 viandes, temps estimé, phases détaillées, conseils de pitmaster. Tu choisis ta pièce, le poids, la temp — l'outil fait le reste."
            badge="Outil principal"
            accent
          />

          {/* Multi-cuisson */}
          <FeatureCard
            to="/multi"
            icon="🍖"
            title="Multi-cuisson"
            description="Tu fais un brisket ET des ribs ? Planifie les deux en même temps pour que tout soit prêt au même moment."
            badge="Gestion du temps"
          />

          {/* Quantités */}
          <FeatureCard
            to="/portions"
            icon="👥"
            title="Calculateur de quantités"
            description="Combien de kg pour 12 personnes ? L'outil te dit exactement ce qu'il faut acheter, avec les rendements après cuisson."
            badge="Avant l'achat"
          />

          {/* Recettes */}
          {isModuleEnabled('recipes') && (
            <FeatureCard
              to="/recettes"
              icon="🧂"
              title="Rubs & Marinades"
              description="Des recettes testées, avec les bons ratios. Du classique Texas au coréen BBQ, y'a de quoi varier."
              badge="Recettes"
            />
          )}

          {/* Live Cook */}
          <FeatureCard
            to="/live"
            icon="🌡️"
            title="Live Cook"
            description="Connecte ta sonde Meater ou FireBoard et suis ta cuisson en temps réel, avec les alertes de phase."
            badge="Temps réel"
          />

          {/* Bois */}
          {isModuleEnabled('wood_guide') && (
            <FeatureCard
              to="/bois"
              icon="🪵"
              title="Essences de bois"
              description="Quel bois pour quelle viande ? Chêne, hickory, cerisier, pommier — chaque essence a son caractère."
              badge="Guide"
            />
          )}
        </div>
      </div>

      {/* ══════════ CTA FINAL ══════════ */}
      <div className="px-6 lg:px-12 pb-16 max-w-4xl">
        <div className="surface-fire p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#ff6b1a]/[0.04] rounded-full blur-[60px] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <h3 className="font-display text-[20px] lg:text-[24px] font-black text-white mb-2">
                Prêt à lancer ta cuisson ?
              </h3>
              <p className="text-[14px] text-stone-400 leading-relaxed">
                Choisis ta viande, entre le poids, et laisse l'outil calculer ton plan complet. C'est aussi simple que ça.
              </p>
            </div>
            <Link
              to="/calculateur"
              className="btn-primary inline-flex items-center gap-2 whitespace-nowrap px-6 py-3.5"
            >
              <span>🔥</span>
              C'est parti
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Feature card ────────────────────────────────────────

function FeatureCard({ to, icon, title, description, badge, accent }) {
  return (
    <Link
      to={to}
      className={`surface p-6 text-left group transition-all hover:border-[#ff6b1a]/15 ${
        accent ? 'surface-fire' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors ${
          accent
            ? 'bg-gradient-to-br from-[#ff6b1a]/15 to-[#dc2626]/10 border border-[#ff6b1a]/10'
            : 'bg-white/[0.03] group-hover:bg-white/[0.05]'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {badge && (
            <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md mb-2 ${
              accent ? 'bg-[#ff6b1a]/15 text-[#ff8c4a]' : 'bg-white/[0.04] text-zinc-500'
            }`}>{badge}</span>
          )}
          <h3 className="text-[15px] font-bold text-white mb-1.5 group-hover:text-[#ff8c4a] transition-colors">{title}</h3>
          <p className="text-[12px] text-stone-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  )
}
