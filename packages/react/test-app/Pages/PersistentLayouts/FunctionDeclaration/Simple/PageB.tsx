import FnSiteLayout from '@/Layouts/FnSiteLayout'
import { Link, usePage } from '@inertiajs/react'

const PageB = () => {
  window._inertia_page_props = usePage().props

  return (
    <div>
      <span className="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/function-declaration/simple/page-a">Page A</Link>
    </div>
  )
}

PageB.layout = FnSiteLayout

export default PageB
