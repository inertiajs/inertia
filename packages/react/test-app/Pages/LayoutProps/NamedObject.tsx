import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const NamedObject = () => {
  return (
    <div>
      <h2>Named Object Layout Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

NamedObject.layout = {
  app: { component: AppLayout, props: { title: 'Named Object Page', showSidebar: false, theme: 'dark' } },
  content: { component: ContentLayout, props: { padding: 'sm', maxWidth: '4xl' } },
}

export default NamedObject
