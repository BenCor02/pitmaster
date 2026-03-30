import { Link } from 'react-router-dom'

export default function GuideCard({ guide }) {
  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="surface overflow-hidden group hover:border-[#ff6b1a]/20 transition-all"
    >
      {guide.cover_url && (
        <div className="h-32 overflow-hidden">
          <img
            src={guide.cover_url}
            alt={guide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4">
        {guide.category && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#ff6b1a]/70 mb-1 block">
            {guide.category}
          </span>
        )}
        <h3 className="text-[14px] font-bold text-zinc-200 group-hover:text-white transition-colors mb-1 leading-tight">
          {guide.title}
        </h3>
        {guide.summary && (
          <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
            {guide.summary}
          </p>
        )}
      </div>
    </Link>
  )
}

export function GuideList({ guides }) {
  if (!guides?.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-xs">📚</span>
        </div>
        <h2 className="text-[14px] font-bold text-white">Guides complémentaires</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {guides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  )
}
