import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import createServer from '@inertiajs/react/server'
import ReactDOMServer from 'react-dom/server'

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    serverHead: (page) => page.props.head,
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
