'use client'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const GuidePage = dynamic(() => import('../../../src/views/GuidePage.jsx'), { ssr: false })

export default function Page() {
  const { slug } = useParams()
  return <GuidePage slug={slug} />
}
