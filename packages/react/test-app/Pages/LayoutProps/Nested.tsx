import { Link } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'
import ContentLayout from '../../Layouts/ContentLayout'

const Nested = () => {
  return (
    <div>
      <h2>Nested Layouts with Static Props</h2>
      <p>This page uses nested layouts with static props in tuple format.</p>
      <p>AppLayout: title="Nested Layouts", sidebar visible, theme="dark" (from layoutProps)</p>
      <p>ContentLayout: padding="lg" (static), maxWidth="xl" (from layoutProps)</p>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

Nested.layout = [
  [AppLayout, { title: 'Nested Layouts', showSidebar: true, theme: 'dark' }],
  [ContentLayout, { padding: 'lg', maxWidth: 'xl' }],
]

export default Nested
