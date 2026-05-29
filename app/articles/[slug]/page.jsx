/**
 * /articles/[slug] — Article individuel (SSG + ISR)
 * generateStaticParams → pages pré-générées au build pour chaque article publié
 */
import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllPublishedSlugs } from '../../../src/lib/articles.js'
import ArticleDetailView from '../../../src/views/ArticleDetailView.jsx'
import { CFHeader } from '../../../src/components/cf/Chrome.jsx'
import { CFFooter } from '../../../src/components/cf/Chrome.jsx'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs().catch(() => [])
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug).catch(() => null)
  if (!article) return {}
  return {
    title: `${article.seo_title || article.title} | Charbon & Flamme`,
    description: article.seo_description || article.excerpt || '',
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || '',
      images: article.cover_url ? [article.cover_url] : [],
      url: `https://charbonetflamme.fr/articles/${article.slug}`,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug).catch(() => null)
  if (!article) notFound()

  return (
    <>
      <CFHeader />
      <ArticleDetailView article={article} />
      <CFFooter />
    </>
  )
}
