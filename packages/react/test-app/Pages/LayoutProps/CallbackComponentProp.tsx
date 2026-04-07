import { Link } from '@inertiajs/react'

const CallbackComponentProp = () => {
  return (
    <div>
      <h2>Callback Component Prop Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

CallbackComponentProp.layout = () => ({
  title: 'Component Prop Title',
  component: 'UserCard',
  showSidebar: false,
})

export default CallbackComponentProp
