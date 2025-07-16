import { Link } from '@inertiajs/react'

window.customComponentEvents = []

const CustomButton = ({ children, ...props }) => (
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

export default () => {
  const trackEvent = (eventName, data = null) => {
    window.customComponentEvents.push({ eventName, data, timestamp: Date.now() })
  }

  return (
    <div>
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
      <Link as={CustomButton} href="/dump/get" preserveState={true} className="preserve">
        Custom Component with Preserve State
      </Link>
      <Link as={CustomButton} href="/dump/get" replace={true} className="replace">
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