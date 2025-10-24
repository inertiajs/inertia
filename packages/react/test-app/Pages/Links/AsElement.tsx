import { Link } from '@inertiajs/react'
import { useRef } from 'react'

declare global {
  interface Window {
    componentEvents: Array<{ eventName: string; data: unknown; timestamp: number }>
  }
}

window.componentEvents = []

export default ({ page }: { page: number }) => {
  const state = useRef(crypto.randomUUID())

  const trackEvent = (eventName: string, data: unknown = null) => {
    window.componentEvents.push({ eventName, data, timestamp: Date.now() })
  }

  return (
    <div>
      <h1>Link Custom Element - Page {page}</h1>
      <p id="state">State: {state.current}</p>
      <Link
        as="div"
        href="/dump/get"
        className="get"
        style={{ backgroundColor: 'blue', color: 'white', padding: '10px' }}
      >
        GET Custom Element
      </Link>
      <Link as="div" method="post" href="/dump/post" className="post">
        POST Custom Element
      </Link>
      <Link as="div" method="post" href="/dump/post" data={{ test: 'data' }} className="data">
        Custom Element with Data
      </Link>
      <Link as="div" href="/dump/get" headers={{ 'X-Test': 'header' }} className="headers">
        Custom Element with Headers
      </Link>
      <Link as="div" href="/links/as-element/2" preserveState={true} className="preserve">
        Custom Element with Preserve State
      </Link>
      <Link as="div" href="/links/as-element/3" replace={true} className="replace">
        Custom Element with Replace
      </Link>
      <Link
        as="div"
        href="/dump/get"
        onStart={(event) => trackEvent('onStart', event)}
        onFinish={(event) => trackEvent('onFinish', event)}
        onSuccess={(page) => trackEvent('onSuccess', page)}
        className="events"
      >
        Custom Element with Events
      </Link>
    </div>
  )
}
