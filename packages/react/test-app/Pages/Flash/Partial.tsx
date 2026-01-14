import { router, usePage } from '@inertiajs/react'
import { useRef, useState } from 'react'

export default ({ count }: { count: number }) => {
  const page = usePage()
  const [flashEventCount, setFlashEventCount] = useState(0)
  const listenerSetup = useRef(false)

  if (!listenerSetup.current) {
    listenerSetup.current = true
    router.on('flash', () => {
      setFlashEventCount((n) => n + 1)
    })
  }

  const reloadWithSameFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'same', count: Date.now() } })
  }

  const reloadWithDifferentFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'different', count: Date.now() } })
  }

  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>
      <span id="flash-event-count">{flashEventCount}</span>
      <span id="count">{count}</span>

      <button onClick={reloadWithSameFlash}>Reload with same flash</button>
      <button onClick={reloadWithDifferentFlash}>Reload with different flash</button>
    </div>
  )
}
