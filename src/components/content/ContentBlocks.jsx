/**
 * ContentBlocks — Composant orchestrateur
 *
 * Charge et affiche tous les blocs de contenu contextuels
 * en fonction du résultat de cuisson actuel.
 */

import { useState, useEffect } from 'react'
import { fetchSeoBlocks, fetchFaqs, fetchAffiliateTools, fetchGuides } from '../../lib/cms.js'
import { faqSchema, injectJsonLd } from '../../lib/seo.js'
import { SeoBlockList } from './SeoBlock.jsx'
import FaqBlock from './FaqBlock.jsx'
import AffiliateBlock from './AffiliateBlock.jsx'
import { GuideList } from './GuideCard.jsx'

export default function ContentBlocks({ meatType, cookingMethod }) {
  const [seoBlocks, setSeoBlocks] = useState([])
  const [faqs, setFaqs] = useState([])
  const [tools, setTools] = useState([])
  const [guides, setGuides] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [seo, faq, aff, gd] = await Promise.all([
          fetchSeoBlocks({ meatType, cookingMethod }),
          fetchFaqs({ meatType, cookingMethod }),
          fetchAffiliateTools({ meatType }),
          fetchGuides({ meatType, limit: 4 }),
        ])

        if (cancelled) return

        setSeoBlocks(seo)
        setFaqs(faq)
        setTools(aff)
        setGuides(gd)

        // Injecter FAQ schema pour Google
        injectJsonLd('faq-schema', faqSchema(faq))
      } catch (err) {
        console.error('ContentBlocks load error:', err)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => {
      cancelled = true
      injectJsonLd('faq-schema', null)
    }
  }, [meatType, cookingMethod])

  // Ne rien afficher tant que pas chargé ou si tout est vide
  if (!loaded) return null
  if (!seoBlocks.length && !faqs.length && !tools.length && !guides.length) return null

  return (
    <div className="space-y-6 mt-8 animate-fade-up">
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {seoBlocks.length > 0 && <SeoBlockList blocks={seoBlocks} />}
      {faqs.length > 0 && <FaqBlock faqs={faqs} />}
      {tools.length > 0 && <AffiliateBlock tools={tools} />}
      {guides.length > 0 && <GuideList guides={guides} />}
    </div>
  )
}
