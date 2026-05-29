/**
 * GET /api/admin/fix-published-at?secret=CRON_SECRET
 * Patch one-shot : met publishedAt = _createdAt sur tous les articles sans date
 */
import { getSanityWriteClient, sanityClient } from '../../../../src/lib/sanity.js'

export async function GET(request) {
  const secret = process.env.CRON_SECRET
  const param  = new URL(request.url).searchParams.get('secret')
  if (secret && param !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const articles = await sanityClient.fetch(
    `*[_type == "article" && !defined(publishedAt)]{ _id, _createdAt }`,
    {},
    { cache: 'no-store' }
  )

  if (!articles?.length) {
    return Response.json({ message: 'Aucun article à corriger', count: 0 })
  }

  const client    = getSanityWriteClient()
  const mutations = articles.map(a => ({
    patch: {
      id:  a._id,
      set: { publishedAt: a._createdAt },
    },
  }))

  await client.mutate(mutations)

  return Response.json({
    fixed: articles.length,
    ids:   articles.map(a => a._id),
  })
}
