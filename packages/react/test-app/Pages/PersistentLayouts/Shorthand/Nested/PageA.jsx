import NestedLayout from '@/Layouts/NestedLayout.jsx'
import SiteLayout from '@/Layouts/SiteLayout.jsx'
import { Link, usePage } from '@inertiajs/react'

const PageA = (props) => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Nested Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/shorthand/nested/page-b">Page B</Link>
    </div>
  )
}

PageA.layout = (page) => {
  return (
    <SiteLayout>
      <NestedLayout children={page} />
    </SiteLayout>
  )
}

export default PageA
