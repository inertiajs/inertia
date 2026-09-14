import type { Page } from '@inertiajs/core'
import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/react'
import { Component, StrictMode, Suspense, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHost } from '../../../tests/app/external-navigation'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <p>Unable to open report</p> : this.props.children
  }
}

window.testing = { Inertia: router }

const host: ReturnType<typeof createHost<Page>> = createHost<Page>(async (page) => {
  let disposeDuringResolution: VoidFunction | undefined

  const options = {
    page,
    dev: true,
    serverHead: true,
    title: (title: string, page: Page) => (page.props.titleSuffix ? `${title} - ${page.props.titleSuffix}` : title),
    externalNavigation: host,
    resolve: async (name: string, page?: Page) => {
      disposeDuringResolution?.()

      const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })
      if (page?.props.waitForComponent) {
        await fetch('/external-navigation/ready')
      }
      return pages[`./Pages/${name}.tsx`]
    },
  }
  const withApp = (app: ReactNode) => (
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<p>Opening report details</p>}>{app}</Suspense>
      </ErrorBoundary>
    </StrictMode>
  )

  if (new URLSearchParams(location.search).has('custom')) {
    let unmount = () => {}
    await createInertiaApp({
      ...options,
      setup({ el, App, props, dispose }) {
        if (new URLSearchParams(location.search).has('disposeDuringResolution')) {
          disposeDuringResolution = () => {
            dispose?.()
            document.body.dataset.disposedDuringResolution = 'true'
          }
        }

        const root = createRoot(el)
        unmount = () => {
          try {
            root.unmount()
          } finally {
            dispose?.()
          }
        }
        root.render(withApp(<App {...props} />))
      },
    })
    return { dispose: unmount }
  }

  const app = await createInertiaApp({ ...options, withApp })
  if (typeof app === 'function') {
    throw new Error('Expected a browser mount')
  }
  return app
})

void host.start(window.initialPage!)
