import { Link } from '@inertiajs/react'

const CallbackDefault = () => {
  return (
    <div>
      <h2>Callback Default Layout Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

CallbackDefault.layout = (props: { userName: string }) => ({
  title: 'Profile: ' + props.userName,
  showSidebar: false,
})

export default CallbackDefault
