import SiteLayout from '@/Layouts/SiteLayout'
import { Link } from '@inertiajs/react'

const PageA = (props) => {
  return (
    <div>
      <span className="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/render-function/simple/page-b">Page B</Link>
    </div>
  )
}

PageA.layout = (page) => <SiteLayout children={page} />

export default PageA
