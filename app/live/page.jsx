'use client'
import dynamic from 'next/dynamic'

const LiveCookPage = dynamic(() => import('../../src/views/LiveCookPage.jsx'), { ssr: false })

export default function Page() {
  return <LiveCookPage />
}
