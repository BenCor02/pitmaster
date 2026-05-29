'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔥</div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 800, color: '#1F1A14', margin: 0 }}>Page introuvable</h1>
      <p style={{ color: '#6E6356', margin: 0 }}>Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" style={{ color: '#8B1A1A', fontWeight: 600, textDecoration: 'none' }}>
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
