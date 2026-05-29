'use client'
import dynamic from 'next/dynamic'


const WoodGuidePage = dynamic(() => import('../../src/views/WoodGuidePage.jsx'), { ssr: false })

export default function Page() {
  return <WoodGuidePage />
}
