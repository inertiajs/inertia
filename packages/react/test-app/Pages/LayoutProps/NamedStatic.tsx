import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const NamedStatic = () => {
  return (
    <div>
      <h2>Named Layouts with Static Props</h2>
      <p>This page uses named layouts with both static and dynamic props.</p>
      <p>AppLayout: title from layoutProps, theme="dark" (static)</p>
      <p>ContentLayout: padding="sm" (static), maxWidth="4xl" (from layoutProps)</p>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

NamedStatic.layout = {
  app: [AppLayout, { title: 'Named Layouts with Static Props', theme: 'dark' }],
  content: [ContentLayout, { padding: 'sm', maxWidth: '4xl' }],
}

export default NamedStatic
