/**
 * Vercel Serverless Proxy — Meater Cloud API
 *
 * Relaie les appels vers https://public-api.cloud.meater.com/v1/*
 * côté serveur pour contourner les restrictions CORS du navigateur.
 *
 * Usage côté client : fetch('/api/meater/login', { method: 'POST', ... })
 *                     fetch('/api/meater/devices', { headers: { Authorization: ... } })
 */

const MEATER_BASE = 'https://public-api.cloud.meater.com/v1'

export default async function handler(req, res) {
  // Extraire le chemin après /api/meater/
  // Méthode 1 : req.query.path (catch-all Vercel)
  // Méthode 2 : fallback sur req.url si query vide
  const { path } = req.query
  let subPath = Array.isArray(path) ? path.join('/') : path || ''

  if (!subPath) {
    // Fallback : extraire depuis l'URL brute
    const match = (req.url || '').match(/\/api\/meater\/(.+?)(?:\?|$)/)
    subPath = match ? match[1] : ''
  }

  if (!subPath) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Chemin API manquant. Utilise /api/meater/login, /api/meater/devices, etc.',
    })
  }

  const targetUrl = `${MEATER_BASE}/${subPath}`
  console.log(`[meater-proxy] ${req.method} ${targetUrl}`)

  // Construire les headers à relayer
  const headers = {
    'Content-Type': 'application/json',
  }

  // Relayer le token d'auth s'il est présent
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization
  }

  try {
    const fetchOpts = {
      method: req.method || 'GET',
      headers,
    }

    // Relayer le body pour POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOpts.body = JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, fetchOpts)

    // Lire le body brut d'abord
    const text = await response.text()

    // Tenter de parser en JSON
    let data
    try {
      data = JSON.parse(text)
    } catch {
      // Meater a renvoyé du non-JSON (HTML d'erreur, etc.)
      return res.status(response.status).json({
        statusCode: response.status,
        message: `Réponse non-JSON de Meater (HTTP ${response.status})`,
        raw: text.slice(0, 500),
      })
    }

    // S'assurer que statusCode est dans le JSON (certaines réponses Meater l'omettent)
    if (data && !data.statusCode) {
      data.statusCode = response.status
    }

    // Relayer le status code original
    res.status(response.status).json(data)
  } catch (err) {
    console.error('Meater proxy error:', err)
    res.status(502).json({
      statusCode: 502,
      message: 'Impossible de joindre le serveur Meater.',
      error: err.message || String(err),
    })
  }
}
