/**
 * /articles — Page liste (Server Component, ISR)
 * Vrai rendu serveur pour indexation Google
 */
import { getPublishedArticles, getArticleCategories } from '../../src/lib/articles.js'
import ArticlesListView from '../../src/views/ArticlesListView.jsx'
import { CFHeader } from '../../src/components/cf/Chrome.jsx'
import { CFFooter } from '../../src/components/cf/Chrome.jsx'

export const revalidate = 3600 // ISR: revalidation toutes les heures

export const metadata = {
  title: 'Articles BBQ — Techniques, guides et science du fumage | Charbon & Flamme',
  description: 'Tous les guides, techniques et articles sur le BBQ, le fumage et la cuisson lente. La référence francophone pour les pitmasters.',
  openGraph: {
    title: 'Articles BBQ | Charbon & Flamme',
    description: 'Guides, techniques et science du BBQ et du fumage.',
    url: 'https://charbonetflamme.fr/articles',
  },
}

export default async function ArticlesPage({ searchParams }) {
  const params = await searchParams
  const category = params?.category || null
  const tag = params?.tag || null

  const [articles, categories] = await Promise.all([
    getPublishedArticles({ category, tag }).catch(() => []),
    getArticleCategories().catch(() => []),
  ])

  return (
    <>
      <CFHeader />
      <ArticlesListView articles={articles} categories={categories} activeCategory={category} />
      <CFFooter />
    </>
  )
}
