'use client'
import dynamic from 'next/dynamic'

const RecipesPage = dynamic(() => import('../../src/views/RecipesPage.jsx'), { ssr: false })

export default function Page() {
  return <RecipesPage />
}
