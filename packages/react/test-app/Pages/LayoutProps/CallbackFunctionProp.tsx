import { Link } from '@inertiajs/react'

const CallbackFunctionProp = () => {
  return (
    <div>
      <h2>Callback Function Prop Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

CallbackFunctionProp.layout = () => ({
  title: 'Function Prop Title',
  showSidebar: false,
  formatName: (name: string) => `Hello, ${name}`,
})

export default CallbackFunctionProp
