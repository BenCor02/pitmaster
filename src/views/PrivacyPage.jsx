'use client'

import React from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { updateMeta } from '../lib/seo.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'

function useMobile() {
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setMobile(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return mobile
}

export default function PrivacyPage() {
  const mobile = useMobile()

  useEffect(() => {
    updateMeta({
      title: 'Politique de confidentialité — Charbon & Flamme',
      description: "Politique de confidentialité de l'application Charbon & Flamme. Données collectées, utilisation et vos droits.",
      canonical: 'https://charbonetflamme.fr/confidentialite',
    })
  }, [])

  const h2Style = {
    fontFamily: 'var(--cf-serif)',
    fontSize: 18,
    fontWeight: 700,
    color: '#1F1A14',
    marginBottom: 8,
    marginTop: 0,
  }

  const pStyle = {
    color: '#1F1A14',
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
  }

  const liStyle = {
    color: '#6E6356',
    fontSize: 14,
    lineHeight: 1.7,
  }

  const strongStyle = {
    color: '#1F1A14',
    fontWeight: 600,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: mobile ? '32px 20px 64px' : '48px 24px 80px',
        }}
      >
        <Link
          href="/"
          style={{
            color: '#8B1A1A',
            fontSize: 13,
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 24,
            fontFamily: 'var(--cf-sans)',
          }}
        >
          ← Retour à l'accueil
        </Link>

        <h1
          style={{
            fontFamily: 'var(--cf-serif)',
            fontSize: mobile ? 28 : 36,
            fontWeight: 800,
            color: '#1F1A14',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}
        >
          Politique de confidentialité
        </h1>
        <p style={{ color: '#6E6356', fontSize: 13, marginBottom: 40 }}>
          Dernière mise à jour : 3 avril 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={h2Style}>Éditeur de l'application</h2>
            <p style={pStyle}>
              Charbon & Flamme est une application éditée par Benjamin Corette, accessible sur le web
              à l'adresse{' '}
              <a href="https://charbonetflamme.fr" style={{ color: '#8B1A1A', textDecoration: 'underline' }}>
                charbonetflamme.fr
              </a>{' '}
              et sur Android via le Google Play Store.
            </p>
          </section>

          <section
            style={{
              padding: '24px',
              background: '#F5EFE0',
              border: '1px solid rgba(31,26,20,0.15)',
              borderRadius: 8,
            }}
          >
            <h2 style={h2Style}>Données collectées</h2>
            <p style={{ ...pStyle, marginBottom: 12 }}>
              L'application collecte le minimum de données nécessaire à son fonctionnement :
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={liStyle}>
                <strong style={strongStyle}>Compte utilisateur (optionnel) :</strong> adresse email et mot de passe via Supabase Auth, uniquement si vous créez un compte pour sauvegarder vos favoris.
              </li>
              <li style={liStyle}>
                <strong style={strongStyle}>Données de cuisson :</strong> les paramètres que vous entrez dans le calculateur (viande, poids, température) ne sont pas stockés sur nos serveurs. Ils restent sur votre appareil.
              </li>
              <li style={liStyle}>
                <strong style={strongStyle}>Connexion sondes (Meater, FireBoard) :</strong> vos identifiants de connexion aux services tiers sont stockés uniquement en session sur votre appareil. Nous ne les conservons pas.
              </li>
              <li style={liStyle}>
                <strong style={strongStyle}>Bluetooth :</strong> l'application peut utiliser le Bluetooth pour se connecter à vos sondes de température. Aucune donnée Bluetooth n'est transmise à nos serveurs.
              </li>
              <li style={liStyle}>
                <strong style={strongStyle}>Analytics :</strong> nous utilisons Plausible Analytics, un service respectueux de la vie privée, sans cookies et conforme au RGPD. Aucune donnée personnelle n'est collectée.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={h2Style}>Cookies</h2>
            <p style={pStyle}>
              Charbon & Flamme n'utilise <strong style={strongStyle}>aucun cookie</strong> de tracking ou publicitaire.
              Plausible Analytics fonctionne sans cookies. Seuls des cookies techniques de session
              peuvent être utilisés pour maintenir votre connexion si vous avez un compte.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Partage des données</h2>
            <p style={{ ...pStyle, marginBottom: 12 }}>
              Vos données ne sont jamais vendues, louées ou partagées à des tiers à des fins commerciales.
              Les seuls services tiers utilisés sont :
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={liStyle}>
                <strong style={strongStyle}>Supabase</strong> — hébergement de la base de données et authentification (serveurs UE)
              </li>
              <li style={liStyle}>
                <strong style={strongStyle}>Vercel</strong> — hébergement du site web
              </li>
              <li style={liStyle}>
                <strong style={strongStyle}>Plausible Analytics</strong> — statistiques anonymes (serveurs UE)
              </li>
            </ul>
          </section>

          <section
            style={{
              padding: '24px',
              background: '#F5EFE0',
              border: '1px solid rgba(31,26,20,0.15)',
              borderRadius: 8,
            }}
          >
            <h2 style={h2Style}>Vos droits (RGPD)</h2>
            <p style={pStyle}>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
              d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
              Vous pouvez supprimer votre compte à tout moment depuis l'application, ou nous contacter
              pour exercer vos droits.
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Sécurité</h2>
            <p style={pStyle}>
              Toutes les communications sont chiffrées via HTTPS. Les mots de passe sont hashés
              et jamais stockés en clair. Nous appliquons les bonnes pratiques de sécurité web
              (CSP, HSTS, protection XSS).
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Contact</h2>
            <p style={pStyle}>
              Pour toute question relative à vos données personnelles, contactez-nous à :{' '}
              <a
                href="mailto:contact@charbonetflamme.fr"
                style={{ color: '#8B1A1A', textDecoration: 'underline' }}
              >
                contact@charbonetflamme.fr
              </a>
            </p>
          </section>
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(31,26,20,0.15)',
            textAlign: 'center',
            fontFamily: 'var(--cf-mono)',
            fontSize: 12,
            color: '#6E6356',
            letterSpacing: '0.04em',
          }}
        >
          © {new Date().getFullYear()} Charbon & Flamme. Tous droits réservés.
        </div>
      </main>
      <CFFooter mobile={mobile} />
    </div>
  )
}
