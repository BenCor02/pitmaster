/**
 * Markdown léger → HTML (avec sanitisation anti-XSS)
 * Pas de dépendance externe. Couvre : headings, bold, italic, lists, links, paragraphs, tables.
 */

/** Échappe les caractères HTML dangereux */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Valide qu'une URL est safe (pas de javascript:, data:, etc.) */
function safeHref(url) {
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return escapeHtml(url.trim())
  }
  return '#'
}

export function renderMarkdown(md) {
  if (!md) return ''

  // Pré-échapper tout le HTML brut avant le parsing markdown
  let html = escapeHtml(md)

  html = html
    // Tables (on travaille sur du texte déjà échappé, pas besoin de ré-échapper les cellules)
    .replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, body) => {
      const ths = header.split('|').filter(Boolean).map(h => `<th class="px-3 py-2 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">${h.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map(row => {
        const tds = row.split('|').filter(Boolean).map(c => `<td class="px-3 py-2 text-[13px] text-zinc-300">${c.trim()}</td>`).join('')
        return `<tr class="border-t border-white/[0.06]">${tds}</tr>`
      }).join('')
      return `<table class="w-full mb-4"><thead><tr class="border-b border-white/[0.08]">${ths}</tr></thead><tbody>${rows}</tbody></table>`
    })
    // Headings
    .replace(/^### (.+)$/gm, '<h4 class="text-[14px] font-bold text-white mt-5 mb-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-[16px] font-bold text-white mt-6 mb-3">$1</h3>')
    // Bold + italic (les contenus sont déjà échappés)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="text-[13px] text-zinc-300 leading-relaxed ml-4 mb-1">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-[13px] text-zinc-300 leading-relaxed ml-4 mb-1" value="$1">$2</li>')
    // Links — URLs validées
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) =>
      `<a href="${safeHref(url)}" class="text-[#ff6b1a] hover:text-[#ff8c4a] underline underline-offset-2" target="_blank" rel="noopener noreferrer">${text}</a>`
    )
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, (match) => {
      if (match.startsWith('<')) return match
      return `<p class="text-[13px] text-zinc-400 leading-relaxed mb-3">${match}</p>`
    })

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="mb-3 list-disc">$1</ul>')

  return html
}
