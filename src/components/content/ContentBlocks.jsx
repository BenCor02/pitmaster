/**
 * ContentBlocks — Composant orchestrateur
 *
 * Charge et affiche tous les blocs de contenu contextuels
 * en fonction du résultat de cuisson actuel.
 */

import { useState, useEffect } from 'react'
import { fetchSeoBlocks, fetchFaqs, fetchAffiliateTools, fetchGuides } from '../../lib/cms.js'
import { faqSchema, injectJsonLd } from '../../lib/seo.js'
import { useSiteSettings } from '../../hooks/useSiteSettings.jsx'
import { SeoBlockList } from './SeoBlock.jsx'
import FaqBlock from './FaqBlock.jsx'
import AffiliateBlock from './AffiliateBlock.jsx'
import { GuideList } from './GuideCard.jsx'

export default function ContentBlocks({ meatType, cookingMethod }) {
  const { isModuleEnabled } = useSiteSettings()
  const [seoBlocks, setSeoBlocks] = useState([])
  const [faqs, setFaqs] = useState([])
  const [tools, setTools] = useState([])
  const [guides, setGuides] = useState([])
  const [loaded, setLoaded] = useState(false)

  const seoEnabled = isModuleEnabled('seo_blocks')
  const faqEnabled = isModuleEnabled('faq')
  const affEnabled = isModuleEnabled('affiliate')
  const guidesEnabled = isModuleEnabled('guides')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [seo, faq, aff, gd] = await Promise.all([
          seoEnabled ? fetchSeoBlocks({ meatType, cookingMethod }) : Promise.resolve([]),
          faqEnabled ? fetchFaqs({ meatType, cookingMethod }) : Promise.resolve([]),
          affEnabled ? fetchAffiliateTools({ meatType }) : Promise.resolve([]),
          guidesEnabled ? fetchGuides({ meatType, limit: 4 }) : Promise.resolve([]),
        ])

        if (cancelled) return

        setSeoBlocks(seo)
        setFaqs(faq)
        setTools(aff)
        setGuides(gd)

        // Injecter FAQ schema pour Google
        if (faqEnabled) injectJsonLd('faq-schema', faqSchema(faq))
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
  }, [meatType, cookingMethod, seoEnabled, faqEnabled, affEnabled, guidesEnabled])

  // Ne rien afficher tant que pas chargé ou si tout est vide
  if (!loaded) return null
  if (!seoBlocks.length && !faqs.length && !tools.length && !guides.length) return null

  return (
    <div className="space-y-6 mt-8 animate-fade-up">
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {seoEnabled && seoBlocks.length > 0 && <SeoBlockList blocks={seoBlocks} />}
      {faqEnabled && faqs.length > 0 && <FaqBlock faqs={faqs} />}
      {affEnabled && tools.length > 0 && <AffiliateBlock tools={tools} />}
      {guidesEnabled && guides.length > 0 && <GuideList guides={guides} />}
    </div>
  )
}
