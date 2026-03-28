import { supabase } from '../supabase/client'

export async function fetchSiteSettingsRow() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data || {}
}

export async function upsertSiteSettingsRow(payload) {
  const body = { id: 1, ...payload }
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(body)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchPageWithSections(slug) {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .in('status', ['published', 'active'])
    .maybeSingle()

  if (pageError) throw pageError
  if (!page) return { page: null, sections: [] }

  const { data: sections, error: sectionError } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', page.id)
    .eq('is_enabled', true)
    .order('order_index', { ascending: true })

  if (sectionError) throw sectionError
  return { page, sections: sections || [] }
}

export async function fetchAdminPages() {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchAdminSections(pageId) {
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', pageId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data || []
}

export async function upsertPage(payload) {
  const { data, error } = await supabase
    .from('pages')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function upsertPageSection(payload) {
  const { data, error } = await supabase
    .from('page_sections')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePageSection(id) {
  const { error } = await supabase.from('page_sections').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSeoBlocks({
  position,
  meatSlug = null,
  methodKey = null,
  pageSlug = 'calculator',
} = {}) {
  let query = supabase
    .from('seo_blocks')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (position) query = query.eq('position', position)

  const { data: blocks, error } = await query
  if (error) throw error

  const filteredBlocks = (blocks || []).filter((block) => {
    const pageOk = !block.page_slug || block.page_slug === pageSlug
    const meatOk = !block.meat_slug || block.meat_slug === meatSlug
    const methodOk = !block.method_key || block.method_key === methodKey
    return pageOk && meatOk && methodOk
  })

  if (!filteredBlocks.length) return []

  const ids = filteredBlocks.map((block) => block.id)
  const { data: products, error: productsError } = await supabase
    .from('seo_block_products')
    .select('*')
    .in('seo_block_id', ids)
    .order('display_order', { ascending: true })

  if (productsError) throw productsError

  const grouped = (products || []).reduce((acc, product) => {
    if (!acc[product.seo_block_id]) acc[product.seo_block_id] = []
    acc[product.seo_block_id].push(product)
    return acc
  }, {})

  return filteredBlocks.map((block) => ({
    ...block,
    products: grouped[block.id] || [],
  }))
}

export async function fetchAdminSeoBlocks() {
  const { data, error } = await supabase
    .from('seo_blocks')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function fetchSeoBlockProducts(seoBlockId) {
  const { data, error } = await supabase
    .from('seo_block_products')
    .select('*')
    .eq('seo_block_id', seoBlockId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function upsertSeoBlock(payload) {
  const body = {
    ...payload,
    display_order: Number(payload.display_order) || 0,
    is_active: payload.is_active !== false,
    settings_json: payload.settings_json || {},
  }
  const { data, error } = await supabase.from('seo_blocks').upsert(body).select().single()
  if (error) throw error
  return data
}

export async function deleteSeoBlock(id) {
  const { error } = await supabase.from('seo_blocks').delete().eq('id', id)
  if (error) throw error
}

export async function upsertSeoBlockProduct(payload) {
  const body = {
    ...payload,
    display_order: Number(payload.display_order) || 0,
    rating: payload.rating === '' || payload.rating == null ? null : Number(payload.rating),
  }
  const { data, error } = await supabase.from('seo_block_products').upsert(body).select().single()
  if (error) throw error
  return data
}

export async function deleteSeoBlockProduct(id) {
  const { error } = await supabase.from('seo_block_products').delete().eq('id', id)
  if (error) throw error
}

export async function fetchMediaLibrary() {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function uploadMediaAsset(file, {
  bucket = 'site-media',
  altText = '',
  title = '',
  uploadedBy = null,
} = {}) {
  const safeName = `${Date.now()}-${file.name}`.replace(/\s+/g, '-').toLowerCase()
  const filePath = `${bucket}/${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(safeName, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(safeName)

  const payload = {
    file_name: file.name,
    file_path: filePath,
    public_url: publicUrlData.publicUrl,
    alt_text: altText,
    title,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: uploadedBy,
  }

  const { data, error } = await supabase
    .from('media_library')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMediaAsset(asset) {
  const pathParts = String(asset.file_path || '').split('/')
  const bucket = pathParts.shift()
  const objectPath = pathParts.join('/')
  if (bucket && objectPath) {
    await supabase.storage.from(bucket).remove([objectPath])
  }
  const { error } = await supabase.from('media_library').delete().eq('id', asset.id)
  if (error) throw error
}

export async function fetchCalculatorCatalog() {
  const [meatsRes, methodsRes, paramsRes] = await Promise.all([
    supabase.from('meats').select('*').order('display_order', { ascending: true }),
    supabase.from('cooking_methods').select('*').order('display_order', { ascending: true }),
    supabase.from('calculator_parameters').select('*'),
  ])

  if (meatsRes.error) throw meatsRes.error
  if (methodsRes.error) throw methodsRes.error
  if (paramsRes.error) throw paramsRes.error

  return {
    meats: meatsRes.data || [],
    methods: methodsRes.data || [],
    parameters: paramsRes.data || [],
  }
}

export async function upsertCalculatorMeat(payload) {
  const { data, error } = await supabase.from('meats').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function upsertCookingMethod(payload) {
  const { data, error } = await supabase.from('cooking_methods').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function upsertCalculatorParameters(payload) {
  const { data, error } = await supabase.from('calculator_parameters').upsert(payload).select().single()
  if (error) throw error
  return data
}
