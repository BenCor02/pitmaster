'use client'
import dynamic from 'next/dynamic'

const SharedCookPage = dynamic(() => import('../../../src/views/SharedCookPage.jsx'), { ssr: false })

export default function Page() {
  return <SharedCookPage />
}
