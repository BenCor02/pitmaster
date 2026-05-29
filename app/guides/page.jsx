import { fetchGuides } from '../../src/lib/cms.js'
import GuidesListPage from '../../src/views/GuidesListPage.jsx'

export const metadata = {
  title: 'Guides BBQ & Fumage',
  description: 'Guides pratiques pour maîtriser le barbecue, le fumage et toutes les techniques pitmaster.',
}

export default async function GuidesPage() {
  const guides = await fetchGuides()
  return <GuidesListPage prefetchedGuides={guides} />
}
