'use client'
import dynamic from 'next/dynamic'

const ComparatorPage = dynamic(() => import('../../src/views/ComparatorPage.jsx'), { ssr: false })

export default function Page() {
  return <ComparatorPage />
}
