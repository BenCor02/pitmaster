import { defineField, defineType } from 'sanity'

const CATEGORIES = [
  { title: '🔥 Technique', value: 'technique' },
  { title: '⚙️ Équipement', value: 'equipement' },
  { title: '🧪 Science BBQ', value: 'science' },
  { title: '🧂 Recette', value: 'recette' },
  { title: '🌍 Culture', value: 'culture' },
  { title: '📅 Saison', value: 'saison' },
]

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: () => '📰',
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
      name: 'excerpt',
      title: 'Extrait',
      type: 'text',
      rows: 3,
      description: 'Accroche affichée sur les cards et dans Google (1-2 phrases)',
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Contenu (Markdown)',
      type: 'text',
      rows: 30,
      description: 'Contenu complet en Markdown',
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: { list: CATEGORIES, layout: 'radio' },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'authorName',
      title: 'Auteur',
      type: 'string',
      initialValue: 'Charbon & Flamme',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
    }),
    defineField({
      name: 'aiGenerated',
      title: 'Généré par IA',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showNewsletter',
      title: 'Afficher le CTA Newsletter',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sourceKeyword',
      title: 'Mot-clé source (IA)',
      type: 'string',
      description: 'Mot-clé BBQ_TOPICS utilisé pour générer cet article — évite les doublons cron',
      readOnly: true,
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
    {
      title: 'Date de publication',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
