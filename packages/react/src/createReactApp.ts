import { PageProps } from '@inertiajs/core'
import { createElement, ReactElement } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App, { InertiaAppProps } from './App'

export function createReactApp<SharedProps extends PageProps = PageProps>(
  el: HTMLElement | null,
  props: InertiaAppProps<SharedProps>,
): ReactElement {
  const appElement = createElement(App, {
    children: undefined,
    initialPage: props.initialPage,
    initialComponent: props.initialComponent,
    resolveComponent: props.resolveComponent,
    titleCallback: props.titleCallback,
    onHeadUpdate: props.onHeadUpdate,
  })

  const isServer = typeof window === 'undefined'

  if (!isServer && el) {
    if (el.dataset.serverRendered === 'true') {
      hydrateRoot(el, appElement)
    } else {
      createRoot(el).render(appElement)
    }
  }

  return appElement
}
