import { Deferred, router, usePage } from '@inertiajs/react'
import { useRef, useState } from 'react'

export default ({ data }: { data?: string }) => {
  const page = usePage()
  const [flashEventCount, setFlashEventCount] = useState(0)
  const listenerSetup = useRef(false)

  if (!listenerSetup.current) {
    listenerSetup.current = true
    router.on('flash', () => {
      setFlashEventCount((n) => n + 1)
    })
  }

  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>
      <span id="flash-event-count">{flashEventCount}</span>

      <Deferred data="data" fallback={<div id="loading">Loading...</div>}>
        <div id="data">{data}</div>
      </Deferred>
    </div>
  )
}
