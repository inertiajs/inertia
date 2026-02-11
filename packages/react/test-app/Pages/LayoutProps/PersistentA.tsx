import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const PersistentA = () => {
  setLayoutProps({
    title: 'Persistent Page A',
  })

  setLayoutPropsFor('content', {
    padding: 'lg',
  })

  return (
    <div>
      <h2>Persistent Page A</h2>

      <nav>
        <Link href="/layout-props/persistent-b">Go to Page B</Link>
      </nav>
    </div>
  )
}

PersistentA.layout = {
  app: AppLayout,
  content: ContentLayout,
}

export default PersistentA
