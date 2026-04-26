/**
 * CHARBON & FLAMME — Images de référence des cuts/méthodes
 *
 * Sert d'image map global pour la landing, les cards, le calculateur.
 * Les valeurs par défaut viennent du brief design (Unsplash).
 *
 * Pour overrider : modifier la clé `recipe_images` dans la table
 * site_settings de Supabase (jsonb { picanha: 'https://...', ... }).
 * Le hook useRecipeImages() merge defaults + override sans bloquer le rendu.
 */

import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

export const DEFAULT_RECIPE_IMAGES = {
  brisket: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80',
  ribs:    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
  picanha: 'https://images.unsplash.com/photo-1607116176544-cdf72050cbf2?w=1200&q=80',
  poulet:  'https://images.unsplash.com/photo-1598103442257-e0a51d2d2cf2?w=1200&q=80',
  pulled:  'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&q=80',
  burger:  'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=1200&q=80',
  saumon:  'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=1200&q=80',
  legumes: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=1200&q=80',
  fire:    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1800&q=80',
  smoke:   'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1800&q=80',
  steak:   'https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?w=1200&q=80',
  rub:     'https://images.unsplash.com/photo-1599909533730-d68bd7160d8d?w=1200&q=80',
}

/**
 * Map un id de cooking_profile Supabase vers une clé d'image.
 * Stratégie : on cherche un ID exact, puis un mot-clé dans l'ID,
 * puis on fallback sur la catégorie.
 */
export function imageKeyFromProfile(profile) {
  if (!profile) return 'fire'
  const id = (profile.id || '').toLowerCase()
  if (id.includes('brisket')) return 'brisket'
  if (id.includes('rib') || id.includes('travers')) return 'ribs'
  if (id.includes('picanha')) return 'picanha'
  if (id.includes('pulled') || id.includes('epaule')) return 'pulled'
  if (id.includes('poulet') || id.includes('volaille')) return 'poulet'
  if (id.includes('burger')) return 'burger'
  if (id.includes('saumon') || id.includes('poisson')) return 'saumon'
  if (id.includes('legum') || id.includes('vege')) return 'legumes'
  if (id.includes('rub')) return 'rub'
  if (id.includes('cote') || id.includes('boeuf') || id.includes('steak') || id.includes('agneau')) return 'steak'
  // Fallback par catégorie
  const cat = (profile.category || '').toLowerCase()
  if (cat === 'porc') return 'pulled'
  if (cat === 'volaille') return 'poulet'
  if (cat === 'agneau') return 'steak'
  if (cat === 'boeuf') return 'steak'
  return 'fire'
}

export function imageForProfile(profile, images = DEFAULT_RECIPE_IMAGES) {
  return images[imageKeyFromProfile(profile)] || images.fire
}

/**
 * Hook de récupération + merge avec les overrides Supabase.
 * - Démarre avec les defaults pour ne jamais bloquer le rendu.
 * - Lance une lecture en arrière-plan dans site_settings.
 */
export function useRecipeImages() {
  const [images, setImages] = useState(DEFAULT_RECIPE_IMAGES)
  useEffect(() => {
    let alive = true
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'recipe_images')
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return
        const override = data?.value
        if (override && typeof override === 'object') {
          setImages({ ...DEFAULT_RECIPE_IMAGES, ...override })
        }
      })
      .catch(() => { /* silencieux : on garde les defaults */ })
    return () => { alive = false }
  }, [])
  return images
}
