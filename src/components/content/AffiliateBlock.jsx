export default function AffiliateBlock({ tools }) {
  if (!tools?.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <span className="text-xs">🛠️</span>
        </div>
        <h2 className="text-[14px] font-bold text-white">Outils recommandés</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map(tool => (
          <a
            key={tool.id}
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="surface p-4 flex gap-4 group hover:border-orange-500/20 transition-all"
          >
            {tool.image_url && (
              <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden shrink-0">
                <img src={tool.image_url} alt={tool.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                  {tool.title}
                </p>
                {tool.badge && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {tool.badge}
                  </span>
                )}
              </div>
              {tool.description && (
                <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 mb-2">
                  {tool.description}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                {tool.cta_text || 'Voir le produit'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 17l9.2-9.2M17 17V8H8" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
