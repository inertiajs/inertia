import { Link } from '@inertiajs/react'
import { useRef } from 'react'

declare global {
  interface Window {
    componentEvents: Array<{ eventName: string; data: unknown; timestamp: number }>
  }
}

window.componentEvents = []

const CustomButton = ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
  <button
    {...props}
    style={{
      backgroundColor: 'blue',
      color: 'white',
      padding: '10px',
    }}
  >
    {children}
  </button>
)

export default ({ page }: { page: number }) => {
  const state = useRef(crypto.randomUUID())

  const trackEvent = (eventName: string, data: unknown = null) => {
    window.componentEvents.push({ eventName, data, timestamp: Date.now() })
  }

  return (
    <div>
      <h1>Link Custom Component - Page {page}</h1>
      <p id="state">State: {state.current}</p>
      <Link as={CustomButton} href="/dump/get" className="get">
        GET Custom Component
      </Link>
      <Link as={CustomButton} method="post" href="/dump/post" className="post">
        POST Custom Component
      </Link>
      <Link as={CustomButton} method="post" href="/dump/post" data={{ test: 'data' }} className="data">
        Custom Component with Data
      </Link>
      <Link as={CustomButton} href="/dump/get" headers={{ 'X-Test': 'header' }} className="headers">
        Custom Component with Headers
      </Link>
      <Link as={CustomButton} href="/links/as-component/2" preserveState={true} className="preserve">
        Custom Component with Preserve State
      </Link>
      <Link as={CustomButton} href="/links/as-component/3" replace={true} className="replace">
        Custom Component with Replace
      </Link>
      <Link
        as={CustomButton}
        href="/dump/get"
        onStart={(event) => trackEvent('onStart', event)}
        onFinish={(event) => trackEvent('onFinish', event)}
        onSuccess={(page) => trackEvent('onSuccess', page)}
        className="events"
      >
        Custom Component with Events
      </Link>
    </div>
  )
}
