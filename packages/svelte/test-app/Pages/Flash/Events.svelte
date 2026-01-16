<script module lang="ts">
  declare global {
    interface Window {
      messages: unknown[]
    }
  }
</script>

<script lang="ts">
  import { router, page } from '@inertiajs/svelte'

  window.messages = []

  const internalAlert = (...args: unknown[]) => {
    window.messages.push(...args)
  }

  const visitWithFlash = (e: Event) => {
    e.preventDefault()

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

  const visitWithoutFlash = (e: Event) => {
    e.preventDefault()

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

  const navigateAway = (e: Event) => {
    e.preventDefault()

    router.get('/')
  }
</script>

<div>
  <span id="flash">{JSON.stringify(page.flash)}</span>

  <a href={'#'} onclick={visitWithFlash} class="with-flash">Visit with flash</a>
  <a href={'#'} onclick={visitWithoutFlash} class="without-flash">Visit without flash</a>
  <a href={'#'} onclick={navigateAway} class="navigate-away">Navigate away</a>
</div>
