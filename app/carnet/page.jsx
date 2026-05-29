'use client'
import dynamic from 'next/dynamic'

const FavoritesPage = dynamic(() => import('../../src/views/FavoritesPage.jsx'), { ssr: false })

export default function Page() {
  return <FavoritesPage />
}
