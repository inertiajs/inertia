import { Link } from '@inertiajs/react'
import NavigateEventTest from '@/Layouts/NavigateEventTest'

const NavigateEvent = () => {
  return (
    <>
      <Link href="/prefetch/navigate-event/cached" prefetch="mount">
        Prefetched Link
      </Link>
      <Link href="/prefetch/navigate-event/fresh">Regular Link</Link>
    </>
  )
}

NavigateEvent.layout = (page: React.ReactNode) => <NavigateEventTest children={page} />

export default NavigateEvent
