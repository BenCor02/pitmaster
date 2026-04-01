/**
 * Bannière "Gratuit pendant le lancement" affichée en haut des pages Pro.
 * Quand le freemium sera activé, cette bannière sera remplacée par un paywall.
 */
export default function ProLaunchBanner() {
  return (
    <div className="mx-auto max-w-2xl mb-6">
      <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-amber-500/[0.08] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-400 border border-amber-500/25 shrink-0">
            PRO
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-zinc-200">
              Gratuit pendant le lancement
            </p>
            <p className="text-[11px] text-zinc-500">
              Cette fonctionnalité sera réservée aux membres Pro. Profites-en !
            </p>
          </div>
        </div>
        {/* Subtle glow */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
      </div>
    </div>
  )
}
