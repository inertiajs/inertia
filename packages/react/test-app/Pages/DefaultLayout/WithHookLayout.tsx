import { Link } from '@inertiajs/react'
import { useId } from 'react'

const HookLayout = ({ children }: { children: React.ReactNode }) => {
  const id = useId()

  return (
    <div id="hook-layout" data-layout-id={id}>
      <span>Hook Layout</span>
      {children}
    </div>
  )
}

const WithHookLayout = () => (
  <div>
    <span id="text">DefaultLayout/WithHookLayout</span>
    <Link href="/default-layout">Navigate Away</Link>
  </div>
)

WithHookLayout.layout = HookLayout

export default WithHookLayout
