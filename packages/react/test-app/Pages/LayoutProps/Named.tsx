import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const Named = () => {
  setLayoutProps({
    title: 'Named Layouts Page',
  })

  setLayoutPropsFor('app', {
    showSidebar: true,
    theme: 'light',
  })

  setLayoutPropsFor('content', {
    padding: 'xl',
    maxWidth: '2xl',
  })

  return (
    <div>
      <h2>Named Layouts Page</h2>
      <p>This page uses named layouts with setLayoutPropsFor.</p>
      <p>App layout should have sidebar visible and light theme.</p>
      <p>Content layout should have xl padding and 2xl maxWidth.</p>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

Named.layout = {
  app: AppLayout,
  content: ContentLayout,
}

export default Named
