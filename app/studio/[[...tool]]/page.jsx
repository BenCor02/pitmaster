/**
 * Sanity Studio embarqué — accessible à /studio
 * Protégé par l'auth Sanity (compte sanity.io requis)
 */
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config.js'

export default function StudioPage() {
  return <NextStudio config={config} />
}
