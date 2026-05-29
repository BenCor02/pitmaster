import { fetchRecipeBySlug, fetchRecipes } from '../../../src/lib/cms.js'
import { notFound } from 'next/navigation'
import RecipeDetailPage from '../../../src/views/RecipeDetailPage.jsx'

export async function generateStaticParams() {
  const recipes = await fetchRecipes()
  return recipes.map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const r = await fetchRecipeBySlug(slug)
  if (!r) return {}
  return { title: r.title, description: r.summary }
}

export default async function RecetteDetailPage({ params }) {
  const { slug } = await params
  const recipe = await fetchRecipeBySlug(slug)
  if (!recipe) notFound()
  return <RecipeDetailPage prefetchedRecipe={recipe} slug={slug} />
}
