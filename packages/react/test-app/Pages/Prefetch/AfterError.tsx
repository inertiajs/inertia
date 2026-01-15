import { router } from '@inertiajs/react'

export default function AfterError() {
  const prefetchPage = () => {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitPage = () => {
    router.visit('/prefetch/swr/1')
  }

  const prefetchNonInertia = () => {
    router.prefetch('/non-inertia', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitNonInertia = () => {
    router.visit('/non-inertia')
  }

  return (
    <div>
      <button onClick={prefetchPage}>Prefetch Page</button>
      <button onClick={visitPage}>Visit Page</button>
      <button onClick={prefetchNonInertia}>Prefetch Non-Inertia</button>
      <button onClick={visitNonInertia}>Visit Non-Inertia</button>
    </div>
  )
}
