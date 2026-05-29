import { fetchGuideBySlug, fetchGuides } from '../../../src/lib/cms.js'
import { notFound } from 'next/navigation'
import GuidePage from '../../../src/views/GuidePage.jsx'

export async function generateStaticParams() {
  const guides = await fetchGuides()
  return guides.map(g => ({ slug: g.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const g = await fetchGuideBySlug(slug)
  if (!g) return {}
  return { title: g.seo_title || g.title, description: g.seo_description || g.summary }
}

export default async function GuideDetailPage({ params }) {
  const { slug } = await params
  const guide = await fetchGuideBySlug(slug)
  if (!guide) notFound()
  return <GuidePage prefetchedGuide={guide} slug={slug} />
}
