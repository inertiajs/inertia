import { router } from '@inertiajs/core'
import { usePage, WhenVisible } from '@inertiajs/react'

const Value = ({ value }) => {
  return <div>{value.text}</div>
}

export default () => {
  const { foo, bar } = usePage().props

  const handleTriggerPageReload = () => {
    router.reload()
  }

  return (
    <div>
      <WhenVisible data="foo" fallback={<div>Loading foo...</div>}>
        <Value value={foo} />
      </WhenVisible>
      <WhenVisible data="bar" fallback={<div>Loading bar...</div>} always>
        <Value value={bar} />
      </WhenVisible>
      <button onClick={handleTriggerPageReload}>Trigger page reload</button>
    </div>
  )
}
