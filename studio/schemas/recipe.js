import { defineField, defineType } from 'sanity'

const TYPES = [
  { title: '🧂 Rub (assaisonnement sec)', value: 'rub' },
  { title: '💧 Sauce d\'arrosage (Mop)', value: 'mop' },
  { title: '🫙 Marinade', value: 'marinade' },
  { title: '💉 Injection', value: 'injection' },
  { title: '✨ Laquage (Glaze)', value: 'glaze' },
]

const MEAT_TYPES = [
  { title: 'Poitrine de bœuf', value: 'brisket' },
  { title: 'Porc effiloché', value: 'pulled_pork' },
  { title: 'Travers de porc', value: 'spare_ribs' },
  { title: 'Côtes levées (Baby back ribs)', value: 'baby_back_ribs' },
  { title: 'Plat de côtes de bœuf', value: 'beef_short_ribs' },
  { title: 'Poulet', value: 'chicken' },
  { title: 'Poitrine de poulet', value: 'chicken_breast' },
  { title: 'Agneau', value: 'lamb' },
  { title: 'Porc (général)', value: 'pork' },
  { title: 'Bœuf (général)', value: 'beef' },
  { title: 'Côte de bœuf / Tomahawk', value: 'tomahawk' },
  { title: 'Palette de porc', value: 'pork_shoulder' },
  { title: 'Saumon', value: 'salmon' },
]

export const recipe = defineType({
  name: 'recipe',
  title: 'Recette',
  type: 'document',
  icon: () => '🧂',
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
      name: 'type',
      title: 'Type de recette',
      type: 'string',
      options: { list: TYPES, layout: 'radio' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Résumé',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingrédients',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Ingrédient', type: 'string' },
          { name: 'qty', title: 'Quantité', type: 'string' },
          { name: 'note', title: 'Note (optionnel)', type: 'string' },
        ],
        preview: {
          select: { title: 'qty', subtitle: 'name' },
          prepare: ({ title, subtitle }) => ({ title: `${title} — ${subtitle}` }),
        },
      }],
    }),
    defineField({
      name: 'steps',
      title: 'Étapes de préparation',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'yieldAmount',
      title: 'Rendement / Quantité produite',
      type: 'string',
      description: 'Ex : "120g — pour 1 poitrine de bœuf"',
    }),
    defineField({
      name: 'prepTime',
      title: 'Temps de préparation',
      type: 'string',
      description: 'Ex : "5 min" ou "10 min + 4h de repos"',
    }),
    defineField({
      name: 'meatTypes',
      title: 'Viandes adaptées',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: MEAT_TYPES, layout: 'tags' },
    }),
    defineField({
      name: 'origin',
      title: 'Origine / Inspiration',
      type: 'string',
      description: 'Ex : "Aaron Franklin — Austin, Texas"',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulté',
      type: 'string',
      options: {
        list: [
          { title: '🟢 Facile', value: 'facile' },
          { title: '🟡 Moyen', value: 'moyen' },
          { title: '🔴 Avancé', value: 'avancé' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'coverUrl',
      title: 'URL image (Unsplash)',
      type: 'url',
    }),
    defineField({
      name: 'coverImage',
      title: 'Image uploadée',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: { list: ['draft', 'published', 'archived'], layout: 'radio' },
      initialValue: 'published',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'type', media: 'coverImage' },
    prepare({ title, subtitle }) {
      const t = TYPES.find(x => x.value === subtitle)
      return { title, subtitle: t?.title || subtitle }
    },
  },
  orderings: [
    { title: 'Type', name: 'typeAsc', by: [{ field: 'type', direction: 'asc' }] },
  ],
})
