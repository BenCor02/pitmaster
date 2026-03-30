import { useState } from 'react'
import { renderMarkdown } from '../../lib/markdown.js'

const INITIAL_COUNT = 4

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors pr-4">
          {faq.question}
        </span>
        <span className={`text-zinc-500 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          className="pb-4 animate-fade-up"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(faq.answer) }}
        />
      )}
    </div>
  )
}

export default function FaqBlock({ faqs }) {
  const [showAll, setShowAll] = useState(false)

  if (!faqs?.length) return null

  const visible = showAll ? faqs : faqs.slice(0, INITIAL_COUNT)
  const hasMore = faqs.length > INITIAL_COUNT

  return (
    <div className="surface p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <span className="text-xs">❓</span>
        </div>
        <h2 className="text-[14px] font-bold text-white">Questions fréquentes</h2>
        <span className="text-[11px] text-zinc-600 ml-auto">{faqs.length} questions</span>
      </div>
      <div>
        {visible.map(faq => (
          <FaqItem key={faq.id} faq={faq} />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          {showAll ? (
            <>
              Réduire
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
            </>
          ) : (
            <>
              Voir les {faqs.length - INITIAL_COUNT} autres questions
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </>
          )}
        </button>
      )}
    </div>
  )
}
