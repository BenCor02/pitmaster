import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { article } from './schemas/article'
import { guide } from './schemas/guide'
import { recipe } from './schemas/recipe'

export default defineConfig({
  name: 'charbon-et-flamme',
  title: 'Charbon & Flamme — Studio',

  projectId: 'nv9jfkc3',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Charbon & Flamme')
          .items([
            S.listItem().title('📰 Articles').schemaType('article')
              .child(S.documentTypeList('article').title('Articles')),
            S.listItem().title('📚 Guides').schemaType('guide')
              .child(S.documentTypeList('guide').title('Guides')),
            S.listItem().title('🧂 Recettes').schemaType('recipe')
              .child(S.documentTypeList('recipe').title('Recettes')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [article, guide, recipe],
  },
})
