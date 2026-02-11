import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const PersistentB = () => {
  setLayoutProps({
    title: 'Persistent Page B',
  })

  setLayoutPropsFor('content', {
    padding: 'xl',
  })

  return (
    <div>
      <h2>Persistent Page B</h2>

      <nav>
        <Link href="/layout-props/persistent-a">Go to Page A</Link>
      </nav>
    </div>
  )
}

PersistentB.layout = {
  app: AppLayout,
  content: ContentLayout,
}

export default PersistentB
