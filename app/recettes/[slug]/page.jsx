'use client'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const RecipeDetailPage = dynamic(() => import('../../../src/views/RecipeDetailPage.jsx'), { ssr: false })

export default function Page() {
  const { slug } = useParams()
  return <RecipeDetailPage slug={slug} />
}
