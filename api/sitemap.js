/**
 * Vercel Serverless Function — Sitemap XML dynamique
 *
 * Génère un sitemap avec toutes les pages statiques + guides + recettes
 * chargés dynamiquement depuis Supabase.
 */

import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://charbonetflamme.fr'

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  let guideSlugs = []
  let recipeSlugs = []

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const [guidesRes, recipesRes] = await Promise.all([
        supabase.from('guides').select('slug, updated_at').eq('status', 'published').order('sort_order', { ascending: true }),
        supabase.from('recipes').select('slug, updated_at').eq('status', 'published').order('sort_order', { ascending: true }),
      ])

      if (guidesRes.data) guideSlugs = guidesRes.data
      if (recipesRes.data) recipeSlugs = recipesRes.data
    } catch (e) {
      console.error('Sitemap: error fetching data', e)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/recettes', changefreq: 'weekly', priority: '0.9' },
    { url: '/guides', changefreq: 'weekly', priority: '0.8' },
    { url: '/comparateur', changefreq: 'monthly', priority: '0.7' },
    { url: '/portions', changefreq: 'monthly', priority: '0.7' },
    { url: '/multi', changefreq: 'monthly', priority: '0.7' },
    { url: '/bois', changefreq: 'monthly', priority: '0.8' },
    { url: '/bbq', changefreq: 'monthly', priority: '0.9' },
    { url: '/live', changefreq: 'monthly', priority: '0.7' },
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
${recipeSlugs.map(r => `  <url>
    <loc>${SITE_URL}/recettes/${r.slug}</loc>
    <lastmod>${r.updated_at ? r.updated_at.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(xml)
}
