'use client'
import dynamic from 'next/dynamic'

const AdminPage = dynamic(() => import('../../../src/views/AdminPage.jsx'), { ssr: false })

export default function Page() {
  return <AdminPage />
}
