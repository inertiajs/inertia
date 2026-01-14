import { router, usePage } from '@inertiajs/react'

declare global {
  interface Window {
    messages: unknown[]
  }
}

window.messages = []

const internalAlert = (...args: unknown[]) => {
  window.messages.push(...args)
}

export default () => {
  const page = usePage()

  const visitWithFlash = () => {
    router.on('flash', (event) => {
      internalAlert('Inertia.on(flash)')
      internalAlert(event.detail.flash)
    })

    document.addEventListener('inertia:flash', (event) => {
      internalAlert('addEventListener(inertia:flash)')
      internalAlert((event as CustomEvent).detail.flash)
    })

    router.post(
      '/flash/events/with-data',
      {},
      {
        onFlash: (flash) => {
          internalAlert('onFlash')
          internalAlert(flash)
        },
        onSuccess: (page) => {
          internalAlert('onSuccess')
          internalAlert(page.flash)
        },
      },
    )
  }

  const visitWithoutFlash = () => {
    router.on('flash', () => {
      internalAlert('Inertia.on(flash)')
    })

    document.addEventListener('inertia:flash', () => {
      internalAlert('addEventListener(inertia:flash)')
    })

    router.post(
      '/flash/events/without-data',
      {},
      {
        onFlash: () => {
          internalAlert('onFlash')
        },
        onSuccess: () => {
          internalAlert('onSuccess')
        },
      },
    )
  }

  const navigateAway = () => {
    router.get('/')
  }

  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          visitWithFlash()
        }}
        className="with-flash"
      >
        Visit with flash
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          visitWithoutFlash()
        }}
        className="without-flash"
      >
        Visit without flash
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          navigateAway()
        }}
        className="navigate-away"
      >
        Navigate away
      </a>
    </div>
  )
}
