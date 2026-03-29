/**
 * Vercel Edge Middleware — Détection bots + prerendering SEO
 *
 * Détecte les crawlers (Googlebot, Bingbot, etc.) et réécriture interne
 * vers /api/prerender qui retourne du HTML complet avec meta tags,
 * contenu et JSON-LD depuis Supabase.
 *
 * Les utilisateurs normaux reçoivent la SPA React classique.
 */

const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'discordbot',
  'embedly',
  'quora link preview',
  'redditbot',
  'slackbot',
]

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|favicon|assets|.*\\..*).*)',
  ],
}

export default async function middleware(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  const isBot = BOT_AGENTS.some(bot => ua.includes(bot))

  if (!isBot) return undefined

  // Bot → fetch interne vers l'API prerender
  const url = new URL(request.url)
  const prerenderUrl = new URL('/api/prerender', url.origin)
  prerenderUrl.searchParams.set('path', url.pathname)

  const res = await fetch(prerenderUrl.toString())
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'index, follow',
    },
  })
}
