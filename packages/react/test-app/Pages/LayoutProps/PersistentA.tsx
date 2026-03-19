import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const PersistentA = () => {
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
PersistentA.layoutProps = (layout: (...args: unknown[]) => void) => {
  layout({ title: 'Persistent Page A' })
  layout('content', { padding: 'lg' })
}

export default PersistentA
