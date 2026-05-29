'use client'
import dynamic from 'next/dynamic'

const MultiCookPage = dynamic(() => import('../../src/views/MultiCookPage.jsx'), { ssr: false })

export default function Page() {
  return <MultiCookPage />
}
