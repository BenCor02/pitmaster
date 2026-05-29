import { defineField, defineType } from 'sanity'

const CATEGORIES = [
  { title: '🥩 Viande', value: 'viande' },
  { title: '🔥 Technique', value: 'technique' },
]

const MEAT_TYPES = [
  { title: 'Poitrine de bœuf (Brisket)', value: 'brisket' },
  { title: 'Porc effiloché (Pulled Pork)', value: 'pulled_pork' },
  { title: 'Travers de porc (Ribs)', value: 'spare_ribs' },
  { title: 'Plat de côtes de bœuf', value: 'beef_short_ribs' },
  { title: 'Paleron de bœuf', value: 'chuck_roast' },
  { title: 'Côte de bœuf / Tomahawk', value: 'tomahawk' },
  { title: 'Poulet entier', value: 'whole_chicken' },
  { title: 'Agneau', value: 'lamb' },
]

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: () => '📚',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Résumé',
      type: 'text',
      rows: 2,
      description: 'Accroche courte affichée sur les cards (1-2 phrases)',
    }),
    defineField({
      name: 'content',
      title: 'Contenu (Markdown)',
      type: 'text',
      rows: 40,
      description: 'Corps du guide en Markdown',
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'coverUrl',
      title: "URL image externe (fallback si pas d'asset Sanity)",
      type: 'url',
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: { list: CATEGORIES, layout: 'radio' },
    }),
    defineField({
      name: 'meatType',
      title: 'Type de viande',
      type: 'string',
      options: { list: MEAT_TYPES },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: { list: ['draft', 'published', 'archived'], layout: 'radio' },
      initialValue: 'published',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'title', title: 'Titre SEO (60 car. max)', type: 'string' },
        { name: 'description', title: 'Meta description (155 car. max)', type: 'text', rows: 2 },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'coverImage' },
    prepare({ title, subtitle }) {
      const cat = CATEGORIES.find(c => c.value === subtitle)
      return { title, subtitle: cat?.title || subtitle || 'Sans catégorie' }
    },
  },
  orderings: [
    { title: 'Date de publication', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
})
