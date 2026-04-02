/**
 * Health check — vérifie que les Vercel Serverless Functions marchent.
 * GET /api/health → { ok: true, timestamp, node }
 */
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    node: process.version,
    method: req.method,
    path: req.url,
  })
}
