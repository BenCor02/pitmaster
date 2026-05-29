'use client'
import dynamic from 'next/dynamic'


const BbqGuidePage = dynamic(() => import('../../src/views/BbqGuidePage.jsx'), { ssr: false })

export default function Page() {
  return <BbqGuidePage />
}
