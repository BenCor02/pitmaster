import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllPublishedSlugs } from '../../../src/lib/sanity.js'
import ArticleDetailView from '../../../src/views/ArticleDetailView.jsx'
import { CFHeader, CFFooter } from '../../../src/components/cf/Chrome.jsx'

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
    title: `${article.seoTitle || article.title} | Charbon & Flamme`,
    description: article.seoDescription || article.excerpt || '',
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || '',
      images: article.coverUrl ? [article.coverUrl] : [],
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
