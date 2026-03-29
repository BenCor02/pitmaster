import { renderMarkdown } from '../../lib/markdown.js'

export default function SeoBlock({ block }) {
  if (!block) return null

  return (
    <article className="surface p-6">
      <h2 className="text-[16px] font-bold text-white mb-4 leading-tight">{block.title}</h2>
      <div
        className="prose-cf"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
      />
    </article>
  )
}

export function SeoBlockList({ blocks }) {
  if (!blocks?.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <span className="text-xs">📖</span>
        </div>
        <h2 className="text-[14px] font-bold text-white">En savoir plus</h2>
      </div>
      {blocks.map(block => (
        <SeoBlock key={block.id} block={block} />
      ))}
    </div>
  )
}
