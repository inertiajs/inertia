import { Link } from '@inertiajs/react'

const CallbackStatic = () => {
  return (
    <div>
      <h2>Static Callback Layout Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

CallbackStatic.layout = () => ({
  title: 'Static Callback Title',
  showSidebar: false,
})

export default CallbackStatic
