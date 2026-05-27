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
    // Tables
    .replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, body) => {
      const ths = header.split('|').filter(Boolean).map(h => `<th>${h.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map(row => {
        const tds = row.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('')
        return `<tr>${tds}</tr>`
      }).join('')
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`
    })
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold + italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li value="$1">$2</li>')
    // Links — URLs validées
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) =>
      `<a href="${safeHref(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`
    )
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, (match) => {
      if (match.startsWith('<')) return match
      return `<p>${match}</p>`
    })

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="mb-3 list-disc">$1</ul>')

  return html
}
