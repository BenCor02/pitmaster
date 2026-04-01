/**
 * Vercel Serverless Proxy — FireBoard Cloud API
 *
 * Relaie les appels vers https://fireboard.io/api/*
 * côté serveur pour contourner les restrictions CORS du navigateur.
 *
 * Usage côté client : fetch('/api/fireboard/rest-auth/login/', { method: 'POST', ... })
 *                     fetch('/api/fireboard/v1/devices.json', { headers: { Authorization: ... } })
 */

const FIREBOARD_BASE = 'https://fireboard.io/api'

export default async function handler(req, res) {
  const { path } = req.query
  const subPath = Array.isArray(path) ? path.join('/') : path || ''
  const targetUrl = `${FIREBOARD_BASE}/${subPath}`

  const headers = {
    'Content-Type': 'application/json',
  }

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization
  }

  try {
    const fetchOpts = {
      method: req.method || 'GET',
      headers,
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOpts.body = JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, fetchOpts)
    const data = await response.json()

    res.status(response.status).json(data)
  } catch (err) {
    res.status(502).json({
      statusCode: 502,
      message: 'Impossible de joindre le serveur FireBoard. Réessaie dans quelques instants.',
    })
  }
}
