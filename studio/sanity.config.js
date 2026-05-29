import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { article } from './schemas/article'

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
            S.listItem()
              .title('📰 Articles')
              .schemaType('article')
              .child(S.documentTypeList('article').title('Articles')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [article],
  },
})
