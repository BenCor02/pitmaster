'use client'
import dynamic from 'next/dynamic'


const GuidesListPage = dynamic(() => import('../../src/views/GuidesListPage.jsx'), { ssr: false })

export default function Page() {
  return <GuidesListPage />
}
