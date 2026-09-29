import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import createServer from '@inertiajs/react/server'
import ReactDOMServer from 'react-dom/server'
import Layer from './Layouts/Layer'

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    layer: Layer,
    loading: (url: string) => {
      if (!url.startsWith('/ssr/layer-loading-base')) {
        return undefined
      }

      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.tsx', { eager: true })
      return pages['./Pages/SSR/LayerLoading.tsx']
    },
    serverHead: (page) => page.props.head as string[],
    resolve: (name) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.tsx', { eager: true })
      return pages[`./Pages/${name}.tsx`]
    },
    setup: ({ App, props }) => <App {...props} />,
    ...(page.url.includes('withTitleCallback') && {
      title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
    }),
  }),
)
