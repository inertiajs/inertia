import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const PersistentB = () => {
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
  app: [AppLayout, { title: 'Persistent Page B' }],
  content: [ContentLayout, { padding: 'xl' }],
}

export default PersistentB
