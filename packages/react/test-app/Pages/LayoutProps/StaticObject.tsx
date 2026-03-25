import { Link } from '@inertiajs/react'

const StaticObject = () => {
  return (
    <div>
      <h2>Static Object Layout Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

StaticObject.layout = {
  title: 'Static Object Title',
  showSidebar: false,
}

export default StaticObject
