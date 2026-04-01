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
  const { path } = req.query
  const subPath = Array.isArray(path) ? path.join('/') : path || ''
  const targetUrl = `${MEATER_BASE}/${subPath}`

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
    const data = await response.json()

    // Relayer le status code original
    res.status(response.status).json(data)
  } catch (err) {
    res.status(502).json({
      statusCode: 502,
      message: 'Impossible de joindre le serveur Meater. Réessaie dans quelques instants.',
    })
  }
}
