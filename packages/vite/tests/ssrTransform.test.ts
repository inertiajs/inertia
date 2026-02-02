import { describe, expect, it } from 'vitest'
import { findInertiaAppExport, wrapWithServerBootstrap } from '../src/ssrTransform'
import { defaultFrameworks } from '../src/frameworks/index'

const wrap = (code: string, options = {}) => wrapWithServerBootstrap(code, options, defaultFrameworks)

describe('SSR Transform', () => {
  describe('findInertiaAppExport', () => {
    it('finds configureInertiaApp call', () => {
      expect(findInertiaAppExport(`configureInertiaApp({ resolve: name => name })`)).toBe(true)
    })

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
      expect(findInertiaAppExport(`export default configureInertiaApp({})`)).toBe(false)
    })
  })

  describe('wrapWithServerBootstrap', () => {
    it('wraps with server bootstrap for Svelte', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/svelte'
configureInertiaApp({ resolve: (name) => name })`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/svelte'
        import createServer from '@inertiajs/svelte/server'
        import { render } from 'svelte/server'

        const ssr = await configureInertiaApp({ resolve: (name) => name })

        createServer((page) => ssr(page, render))"
      `)
    })

    it('wraps with server bootstrap for Vue', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/vue3'
configureInertiaApp({})`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/vue3'
        import createServer from '@inertiajs/vue3/server'
        import { renderToString } from 'vue/server-renderer'

        const render = await configureInertiaApp({})

        createServer((page) => render(page, renderToString))"
      `)
    })

    it('wraps with server bootstrap for React', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/react'
configureInertiaApp({})`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/react'
        import createServer from '@inertiajs/react/server'
        import { renderToString } from 'react-dom/server'

        const render = await configureInertiaApp({})

        createServer((page) => render(page, renderToString))"
      `)
    })

    it('includes port and cluster config', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/svelte'
configureInertiaApp({})`

      expect(wrap(code, { port: 13715, cluster: true })).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/svelte'
        import createServer from '@inertiajs/svelte/server'
        import { render } from 'svelte/server'

        const ssr = await configureInertiaApp({})

        createServer((page) => ssr(page, render), {"port":13715,"cluster":true})"
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

        createServer((page) => render(page, renderToString))

        initializeTheme()"
      `)
    })
  })
})
