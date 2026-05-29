import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/plugins/structure'
import { visionTool } from '@sanity/vision'
import article from './sanity/schemas/article.js'

export default defineConfig({
  name: 'charbon-et-flamme',
  title: 'Charbon & Flamme — Studio',
  projectId: 'nv9jfkc3',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Charbon & Flamme')
          .items([
            S.listItem().title('📰 Articles').schemaType('article').child(
              S.documentTypeList('article').title('Articles')
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: [article] },
})
