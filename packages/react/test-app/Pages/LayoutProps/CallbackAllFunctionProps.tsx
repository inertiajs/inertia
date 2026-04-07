import { Link } from '@inertiajs/react'

const CallbackAllFunctionProps = () => {
  return (
    <div>
      <h2>Callback All Function Props Page</h2>

      <nav>
        <Link href="/layout-props/basic">Go to Basic Page</Link>
      </nav>
    </div>
  )
}

CallbackAllFunctionProps.layout = () => ({
  formatTitle: (name: string) => `Profile: ${name}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
})

export default CallbackAllFunctionProps
