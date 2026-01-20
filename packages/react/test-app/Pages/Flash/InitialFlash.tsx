import { router, usePage } from '@inertiajs/react'
import { useRef, useState } from 'react'

export default () => {
  const page = usePage()
  const [, forceUpdate] = useState(0)
  const flashEvents = useRef<Record<string, unknown>[]>([])
  const listenerSetup = useRef(false)

  if (!listenerSetup.current) {
    listenerSetup.current = true
    router.on('flash', (e) => {
      flashEvents.current.push(e.detail.flash)
      forceUpdate((n) => n + 1)
    })
  }

  return (
    <div>
      <span id="flash">{page.flash ? JSON.stringify(page.flash) : 'no-flash'}</span>
      <span id="flash-events">{JSON.stringify(flashEvents.current)}</span>
    </div>
  )
}
