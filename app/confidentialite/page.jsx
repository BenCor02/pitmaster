'use client'
import dynamic from 'next/dynamic'

const PrivacyPage = dynamic(() => import('../../src/views/PrivacyPage.jsx'), { ssr: false })

export default function Page() {
  return <PrivacyPage />
}
