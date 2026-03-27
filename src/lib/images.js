/**
 * PitMaster — Images Unsplash
 * Toutes libres de droits (Unsplash License)
 * Format : https://images.unsplash.com/photo-ID?w=SIZE&q=80&fit=crop
 */

const U = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=80&fit=crop&auto=format`

// ── Viandes ───────────────────────────────────────────────────
export const MEAT_IMAGES = {
  // PATCH: sélection fixe plus cohérente viande par viande, basée sur de vraies photos ciblées
  brisket: 'https://images.unsplash.com/photo-1694619003734-0ee52758ddc3?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq3',
  pork_shoulder: 'https://images.unsplash.com/photo-1771696925702-aadb4f7a1175?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq3',
  ribs_pork: 'https://images.unsplash.com/photo-1578981931698-7d3b21a0d6ac?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq2',
  ribs_beef: 'https://images.unsplash.com/photo-1625604086816-4bfaf603e842?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq2',
  ribs_baby_back: 'https://images.unsplash.com/photo-1578981931698-7d3b21a0d6ac?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq2',
  paleron: 'https://images.unsplash.com/photo-1750461325999-a092ac3964cf?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq3',
  plat_de_cote: 'https://images.unsplash.com/photo-1625604086816-4bfaf603e842?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq2',
  lamb_shoulder: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq3',
  whole_chicken: 'https://images.unsplash.com/photo-1712579733874-c3a79f0f9d12?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq2',
  chicken_pieces: 'https://images.unsplash.com/photo-1750277093031-1ef101be01c5?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq2',
  lamb_leg: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&fm=jpg&q=80&w=1600&v=bbq3',
}

// ── Landing / Hero ────────────────────────────────────────────
export const HERO_IMAGE    = U('photo-1555396273-367ea4eb4db5', 1600, 900)
export const SMOKE_IMAGE   = U('photo-1558030006-450675393462', 1200, 700)
export const SMOKER_IMAGE  = U('photo-1534939939432-d1a05c326d6e', 1200, 700)

// ── Session de cuisson ────────────────────────────────────────
export const SESSION_IMAGE = U('photo-1590534247854-e97d5e3feef6', 800, 500)
