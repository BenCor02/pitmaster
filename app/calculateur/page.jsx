'use client'
import dynamic from 'next/dynamic'

const CalculatorPage = dynamic(() => import('../../src/views/CalculatorPage.jsx'), { ssr: false })

export default function Page() {
  return <CalculatorPage />
}
