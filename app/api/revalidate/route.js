/**
 * Webhook Sanity → Next.js revalidation
 * Invalide instantanément le cache quand un document est publié/modifié dans Sanity.
 *
 * Setup dans Sanity Studio :
 *   manage.sanity.io → projet → API → Webhooks → Add webhook
 *   URL : https://charbonetflamme.fr/api/revalidate
 *   Trigger on : Create, Update, Delete
 *   Filter : _type in ["article", "guide", "recipe"]
 *   Secret : même valeur que SANITY_WEBHOOK_SECRET dans Vercel
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const secret = req.headers.get('x-webhook-secret')

  // Vérifie le secret si configuré
  if (process.env.SANITY_WEBHOOK_SECRET && secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { _type, slug } = body

    switch (_type) {
      case 'article':
        revalidatePath('/articles')
        if (slug?.current) revalidatePath(`/articles/${slug.current}`)
        break
      case 'guide':
        revalidatePath('/guides')
        if (slug?.current) revalidatePath(`/guides/${slug.current}`)
        break
      case 'recipe':
        revalidatePath('/recettes')
        if (slug?.current) revalidatePath(`/recettes/${slug.current}`)
        break
      default:
        revalidatePath('/')
    }

    return NextResponse.json({ revalidated: true, type: _type })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
