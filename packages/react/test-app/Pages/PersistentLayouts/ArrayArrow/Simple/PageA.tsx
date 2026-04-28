import SiteLayout from '@/Layouts/SiteLayout'
import { Link, usePage } from '@inertiajs/react'

const PageA = () => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/array-arrow/simple/page-b">Page B</Link>
    </div>
  )
}

PageA.layout = [SiteLayout]

export default PageA
