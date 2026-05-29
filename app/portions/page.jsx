'use client'
import dynamic from 'next/dynamic'

const PortionCalculatorPage = dynamic(() => import('../../src/views/PortionCalculatorPage.jsx'), { ssr: false })

export default function Page() {
  return <PortionCalculatorPage />
}
