import { redirect } from 'next/navigation'

/**
 * Le Studio Sanity est déployé séparément dans /studio (sous-projet indépendant).
 * On redirige vers studio.charbonetflamme.fr (ou l'URL Sanity-hébergée).
 */
export default function StudioPage() {
  redirect('https://studio.charbonetflamme.fr')
}
