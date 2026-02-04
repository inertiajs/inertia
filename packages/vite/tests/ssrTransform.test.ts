import { describe, expect, it } from 'vitest'
import { defaultFrameworks } from '../src/frameworks/index'
import { findInertiaAppExport, wrapWithServerBootstrap } from '../src/ssrTransform'

const wrap = (code: string, options = {}) => wrapWithServerBootstrap(code, options, defaultFrameworks)

describe('SSR Transform', () => {
  describe('findInertiaAppExport', () => {
    it('finds createInertiaApp call', () => {
      expect(findInertiaAppExport(`createInertiaApp({ resolve: name => name })`)).toBe(true)
    })

    it('returns false for other function calls', () => {
      expect(findInertiaAppExport(`someOtherFunction({})`)).toBe(false)
    })

    it('returns false for invalid code', () => {
      expect(findInertiaAppExport(`{{{ invalid syntax`)).toBe(false)
    })

    it('returns false for export default', () => {
      expect(findInertiaAppExport(`export default createInertiaApp({})`)).toBe(false)
    })

    it('finds createServer call (legacy pattern)', () => {
      expect(findInertiaAppExport(`createServer((page) => createInertiaApp({ page }))`)).toBe(true)
    })

    it('returns false for export default createServer', () => {
      expect(findInertiaAppExport(`export default createServer((page) => createInertiaApp({ page }))`)).toBe(false)
    })
  })

  describe('wrapWithServerBootstrap', () => {
    it('wraps with server bootstrap for Svelte', () => {
      const code = `import { createInertiaApp } from '@inertiajs/svelte'
createInertiaApp({ resolve: (name) => name })`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/svelte'
        import createServer from '@inertiajs/svelte/server'
        import { render } from 'svelte/server'

        const ssr = await createInertiaApp({ resolve: (name) => name })

        const renderPage = (page) => ssr(page, render)

        if (!import.meta.hot) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('wraps with server bootstrap for Vue', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
createInertiaApp({})`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        import createServer from '@inertiajs/vue3/server'
        import { renderToString } from 'vue/server-renderer'

        const render = await createInertiaApp({})

        const renderPage = (page) => render(page, renderToString)

        if (!import.meta.hot) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('wraps with server bootstrap for React', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
createInertiaApp({})`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/react'
        import createServer from '@inertiajs/react/server'
        import { renderToString } from 'react-dom/server'

        const render = await createInertiaApp({})

        const renderPage = (page) => render(page, renderToString)

        if (!import.meta.hot) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('includes port and cluster config', () => {
      const code = `import { createInertiaApp } from '@inertiajs/svelte'
createInertiaApp({})`

      expect(wrap(code, { port: 13715, cluster: true })).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/svelte'
        import createServer from '@inertiajs/svelte/server'
        import { render } from 'svelte/server'

        const ssr = await createInertiaApp({})

        const renderPage = (page) => ssr(page, render)

        if (!import.meta.hot) {
          createServer(renderPage, {"port":13715,"cluster":true})
        }

        export default renderPage"
      `)
    })

    it('returns null for non-Inertia calls', () => {
      expect(wrap(`someOtherFunction({})`)).toBeNull()
    })

    it('preserves variables and code around the call', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
import { initializeTheme } from './composables/useAppearance'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createInertiaApp({
    title: (title) => title ? \`\${title} - \${appName}\` : appName,
    progress: { color: '#4B5563' },
})

initializeTheme()`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        import { initializeTheme } from './composables/useAppearance'

        const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

        import createServer from '@inertiajs/vue3/server'
        import { renderToString } from 'vue/server-renderer'

        const render = await createInertiaApp({
            title: (title) => title ? \`\${title} - \${appName}\` : appName,
            progress: { color: '#4B5563' },
        })

        const renderPage = (page) => render(page, renderToString)

        if (!import.meta.hot) {
          createServer(renderPage)
        }

        export default renderPage

        initializeTheme()"
      `)
    })

    it('adds export default to legacy createServer pattern', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
import createServer from '@inertiajs/vue3/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => name,
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin)
    },
  }),
)`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        import createServer from '@inertiajs/vue3/server'
        import { createSSRApp, h } from 'vue'
        import { renderToString } from 'vue/server-renderer'

        export default createServer((page) =>
          createInertiaApp({
            page,
            render: renderToString,
            resolve: (name) => name,
            setup({ App, props, plugin }) {
              return createSSRApp({ render: () => h(App, props) }).use(plugin)
            },
          }),
        )"
      `)
    })

    it('does not transform createServer if already exported', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
import createServer from '@inertiajs/vue3/server'

export default createServer((page) => createInertiaApp({ page }))`

      expect(wrap(code)).toBeNull()
    })
  })
})
