/**
 * Markdown léger → HTML (avec sanitisation anti-XSS)
 * Couvre : images, headings, bold, italic, lists, links, paragraphs, tables, blockquotes, hr.
 */

/** Échappe les caractères HTML dangereux dans du texte brut */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Valide et retourne une URL safe (rejette javascript:, data:, etc.)
 * NE ré-échappe PAS — l'URL a déjà été traitée par escapeHtml globalement.
 */
function safeUrl(url) {
  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('/') ||
    lower.startsWith('#')
  ) {
    return trimmed
  }
  return '#'
}

export function renderMarkdown(md) {
  if (!md) return ''

  // 1. Extraire les blocs image AVANT l'échappement pour récupérer les URLs proprement
  //    Format : ![alt text](https://...)
  const imageSlots = []
  let processed = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const placeholder = `%%IMG_${imageSlots.length}%%`
    imageSlots.push({ alt: alt.trim(), url: url.trim() })
    return placeholder
  })

  // 2. Extraire les liens markdown pour la même raison
  const linkSlots = []
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const placeholder = `%%LNK_${linkSlots.length}%%`
    linkSlots.push({ text: text.trim(), url: url.trim() })
    return placeholder
  })

  // 3. Échapper tout le texte restant (hors URLs déjà extraites)
  let html = escapeHtml(processed)

  // 4. Appliquer les transformations Markdown
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
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr />')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li value="$1">$2</li>')
    // Paragraphs (lignes non-HTML)
    .replace(/^(?!<[a-z/]|%%)((?!\s*$).+)$/gm, match => `<p>${match}</p>`)

  // 5. Réinjecter les images
  imageSlots.forEach(({ alt, url }, i) => {
    const safeAlt = escapeHtml(alt)
    const safeImgUrl = safeUrl(url)
    const imgHtml = `<figure style="margin:28px 0"><img src="${safeImgUrl}" alt="${safeAlt}" loading="lazy" style="width:100%;border-radius:4px;display:block;object-fit:cover" />${safeAlt ? `<figcaption style="font-size:12px;color:#6E6356;margin-top:6px;font-style:italic;text-align:center">${safeAlt}</figcaption>` : ''}</figure>`
    html = html.replace(`%%IMG_${i}%%`, imgHtml)
  })

  // 6. Réinjecter les liens
  linkSlots.forEach(({ text, url }, i) => {
    const safeLinkUrl = safeUrl(url)
    const isExternal = url.startsWith('http')
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
    html = html.replace(`%%LNK_${i}%%`, `<a href="${safeLinkUrl}"${attrs}>${escapeHtml(text)}</a>`)
  })

  // 7. Wrapper les <li> consécutifs en <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul>$1</ul>')

  return html
}
