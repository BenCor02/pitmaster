import { getPublishedArticles, getArticleCategories } from '../../src/lib/sanity.js'
import ArticlesListView from '../../src/views/ArticlesListView.jsx'
import { CFHeader, CFFooter } from '../../src/components/cf/Chrome.jsx'

export const revalidate = 3600

export const metadata = {
  title: 'Articles BBQ — Techniques, guides et science du fumage | Charbon & Flamme',
  description: 'Tous les guides, techniques et articles sur le BBQ, le fumage et la cuisson lente.',
  openGraph: {
    title: 'Articles BBQ | Charbon & Flamme',
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
