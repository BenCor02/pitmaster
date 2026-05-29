'use client'
import { useEffect } from 'react'
import { updateMeta } from '../lib/seo.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'
import { FireButton } from '../components/cf/Primitives.jsx'
import Link from 'next/link'

export default function LiveCookPage() {
  useEffect(() => {
    updateMeta({
      title: 'Live Cook — Suivi de température en direct | Charbon & Flamme',
      description: 'Connectez vos sondes Meater, Fireboard ou Inkbird pour suivre vos cuissons en temps réel.',
    })
  }, [])

  const features = [
    { icon: '📡', title: 'Sondes Bluetooth', desc: 'Meater, Inkbird — connexion directe sans Wi-Fi' },
    { icon: '🌡️', title: 'Graphique en temps réel', desc: 'Courbe de température minute par minute' },
    { icon: '🔔', title: 'Alertes de cuisson', desc: 'Notification quand la cible est atteinte' },
    { icon: '🔥', title: 'Fireboard & Meater Cloud', desc: 'Sync avec vos appareils via API' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, background: '#8B1A1A', borderRadius: 4,
            marginBottom: 24,
          }}>
            <svg viewBox="0 0 40 40" width={36} height={36}>
              <path d="M20 32C14 28 12 22 16 16C18 14 20 11 20 8C20 11 22 14 24 16C28 22 26 28 20 32Z" fill="#F5EFE0"/>
              <path d="M20 30C17 27 16 24 18 20C19 18 20 16 20 14C20 16 21 18 22 20C24 24 23 27 20 30Z" fill="#E8A53C"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 12 }}>
            Bientôt disponible sur web
          </p>
          <h1 style={{ fontFamily: 'var(--cf-serif)', fontSize: 48, fontWeight: 800, lineHeight: 1, textTransform: 'uppercase', color: '#1F1A14', margin: '0 0 20px' }}>
            Live<br/>Cook
          </h1>
          <p style={{ fontSize: 16, color: '#6E6356', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 32px' }}>
            Le suivi de température en direct est disponible sur l'application mobile.
            La version web arrive prochainement avec support Meater Cloud et Fireboard.
          </p>
          <FireButton as={Link} href="/calculateur" size="md">
            Utiliser le calculateur
          </FireButton>
        </div>

        {/* Features grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 56 }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: '#fff', border: '1px solid rgba(31,26,20,0.10)',
              borderRadius: 8, padding: '20px 20px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--cf-serif)', fontWeight: 700, fontSize: 15, color: '#1F1A14', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#6E6356', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA newsletter */}
        <div style={{
          background: '#1F1A14', borderRadius: 8, padding: '32px',
          textAlign: 'center', color: '#F5EFE0',
        }}>
          <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E8A53C', marginBottom: 12 }}>
            Soyez notifié
          </p>
          <h2 style={{ fontFamily: 'var(--cf-serif)', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
            Disponible sur l&apos;app mobile
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(245,239,224,0.6)', margin: '0 0 20px' }}>
            iOS & Android — connexion Bluetooth directe avec vos sondes
          </p>
          <FireButton size="md" type="cream" as={Link} href="/">
            Retour à l&apos;accueil
          </FireButton>
        </div>

      </main>
      <CFFooter />
    </div>
  )
}
