/**
 * PitMaster — Images Unsplash
 * Toutes libres de droits (Unsplash License)
 * Format : https://images.unsplash.com/photo-ID?w=SIZE&q=80&fit=crop
 */

const U = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=80&fit=crop&auto=format`

// PATCH: requêtes photo plus explicites pour coller visuellement à chaque viande
const S = (query, w = 800, h = 600) =>
  `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(query)}`

// ── Viandes ───────────────────────────────────────────────────
export const MEAT_IMAGES = {
  brisket:       S('smoked brisket bbq sliced', 800, 500),
  pork_shoulder: S('pulled pork bbq smoked', 800, 500),
  ribs_pork:     S('pork ribs bbq smoked', 800, 500),
  ribs_beef:     S('beef short ribs bbq smoked', 800, 500),
  ribs_baby_back:S('baby back ribs bbq smoked', 800, 500),
  paleron:       S('smoked chuck roast bbq', 800, 500),
  plat_de_cote:  S('beef short ribs plate ribs bbq', 800, 500),
  lamb_shoulder: S('smoked lamb shoulder bbq', 800, 500),
  // PATCH: visuels ajoutés pour éviter les cartes vides sur la landing et dans l'app
  whole_chicken: S('whole chicken smoker bbq', 800, 500),
  chicken_pieces: S('smoked chicken thighs drumsticks bbq', 800, 500),
  lamb_leg: S('smoked lamb leg bbq', 800, 500),
}

// ── Landing / Hero ────────────────────────────────────────────
export const HERO_IMAGE    = U('photo-1555396273-367ea4eb4db5', 1600, 900)
export const SMOKE_IMAGE   = U('photo-1558030006-450675393462', 1200, 700)
export const SMOKER_IMAGE  = U('photo-1534939939432-d1a05c326d6e', 1200, 700)

// ── Session de cuisson ────────────────────────────────────────
export const SESSION_IMAGE = U('photo-1590534247854-e97d5e3feef6', 800, 500)
