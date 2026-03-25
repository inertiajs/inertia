import { setLayoutProps } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const NamedDynamic = () => {
  return (
    <div>
      <h2>Named Dynamic Layout Page</h2>

      <button type="button" onClick={() => setLayoutProps('app', { title: 'Updated App Title' })}>
        Update App Title
      </button>
      <button type="button" onClick={() => setLayoutProps('content', { padding: 'xl' })}>
        Update Content Padding
      </button>
    </div>
  )
}

NamedDynamic.layout = {
  app: [AppLayout, { title: 'Named Dynamic Page' }],
  content: [ContentLayout, { padding: 'md' }],
}

export default NamedDynamic
