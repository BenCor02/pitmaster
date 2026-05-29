'use client'
import dynamic from 'next/dynamic'

const JournalPage = dynamic(() => import('../../src/views/JournalPage.jsx'), { ssr: false })

export default function Page() {
  return <JournalPage />
}
