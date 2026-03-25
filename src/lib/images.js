/**
 * PitMaster — Images Unsplash
 * Toutes libres de droits (Unsplash License)
 * Format : https://images.unsplash.com/photo-ID?w=SIZE&q=80&fit=crop
 */

const U = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=80&fit=crop&auto=format`

// ── Viandes ───────────────────────────────────────────────────
export const MEAT_IMAGES = {
  brisket:       U('photo-1558030006-450675393462', 800, 500),
  pork_shoulder: U('photo-1529193591184-b1d58069ecdd', 800, 500),
  ribs_pork:     U('photo-1544025162-d76694265947', 800, 500),
  ribs_beef:     U('photo-1555939594-58d7cb561ad1', 800, 500),
  ribs_baby_back:U('photo-1544025162-d76694265947', 800, 500),
  paleron:       U('photo-1546964124-0cce460f38ef', 800, 500), // chuck roast beef
  plat_de_cote:  U('photo-1607532941433-304659e8198a', 800, 500), // short ribs beef
  lamb_shoulder: U('photo-1504674900247-0877df9cc836', 800, 500),
}

// ── Landing / Hero ────────────────────────────────────────────
export const HERO_IMAGE    = U('photo-1555396273-367ea4eb4db5', 1600, 900)
export const SMOKE_IMAGE   = U('photo-1558030006-450675393462', 1200, 700)
export const SMOKER_IMAGE  = U('photo-1534939939432-d1a05c326d6e', 1200, 700)

// ── Session de cuisson ────────────────────────────────────────
export const SESSION_IMAGE = U('photo-1590534247854-e97d5e3feef6', 800, 500)