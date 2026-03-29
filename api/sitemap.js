/**
 * Vercel Serverless Function — Sitemap XML dynamique
 *
 * Génère un sitemap avec toutes les pages statiques + les guides
 * chargés dynamiquement depuis Supabase.
 *
 * Accessible à : /api/sitemap
 */

import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://charbonetflamme.fr'

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  let guideSlugs = []

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from('guides')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('sort_order', { ascending: true })

      if (data) guideSlugs = data
    } catch (e) {
      console.error('Sitemap: error fetching guides', e)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/guides', changefreq: 'weekly', priority: '0.8' },
    { url: '/login', changefreq: 'monthly', priority: '0.2' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${guideSlugs.map(g => `  <url>
    <loc>${SITE_URL}/guides/${g.slug}</loc>
    <lastmod>${g.updated_at ? g.updated_at.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(xml)
}
