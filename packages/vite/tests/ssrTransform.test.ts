import { describe, expect, it } from 'vitest'
import { findInertiaAppExport, wrapWithServerBootstrap } from '../src/ssrTransform'

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

      expect(wrapWithServerBootstrap(code, {})).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/svelte'
        import __inertia_createServer__ from '@inertiajs/core/server'
        import { render as __inertia_ssr_render__ } from 'svelte/server'
        const __inertia_app__ = await configureInertiaApp({ resolve: (name) => name })
        const __inertia_render__ = (page) => __inertia_app__(page, __inertia_ssr_render__)
        __inertia_createServer__(__inertia_render__)
        export default __inertia_render__"
      `)
    })

    it('wraps with server bootstrap for Vue', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/vue3'
configureInertiaApp({})`

      expect(wrapWithServerBootstrap(code, {})).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/vue3'
        import __inertia_createServer__ from '@inertiajs/core/server'
        import { renderToString as __inertia_ssr_render__ } from 'vue/server-renderer'
        const __inertia_app__ = await configureInertiaApp({})
        const __inertia_render__ = (page) => __inertia_app__(page, __inertia_ssr_render__)
        __inertia_createServer__(__inertia_render__)
        export default __inertia_render__"
      `)
    })

    it('wraps with server bootstrap for React', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/react'
configureInertiaApp({})`

      expect(wrapWithServerBootstrap(code, {})).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/react'
        import __inertia_createServer__ from '@inertiajs/core/server'
        import { renderToString as __inertia_ssr_render__ } from 'react-dom/server'
        const __inertia_app__ = await configureInertiaApp({})
        const __inertia_render__ = (page) => __inertia_app__(page, __inertia_ssr_render__)
        __inertia_createServer__(__inertia_render__)
        export default __inertia_render__"
      `)
    })

    it('includes port and cluster config', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/svelte'
configureInertiaApp({})`

      expect(wrapWithServerBootstrap(code, { port: 13715, cluster: true })).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/svelte'
        import __inertia_createServer__ from '@inertiajs/core/server'
        import { render as __inertia_ssr_render__ } from 'svelte/server'
        const __inertia_app__ = await configureInertiaApp({})
        const __inertia_render__ = (page) => __inertia_app__(page, __inertia_ssr_render__)
        __inertia_createServer__(__inertia_render__, {"port":13715,"cluster":true})
        export default __inertia_render__"
      `)
    })

    it('returns null for non-Inertia calls', () => {
      expect(wrapWithServerBootstrap(`someOtherFunction({})`, {})).toBeNull()
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

      expect(wrapWithServerBootstrap(code, {})).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        import { initializeTheme } from './composables/useAppearance'

        const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

        import __inertia_createServer__ from '@inertiajs/core/server'
        import { renderToString as __inertia_ssr_render__ } from 'vue/server-renderer'
        const __inertia_app__ = await createInertiaApp({
            title: (title) => title ? \`\${title} - \${appName}\` : appName,
            progress: { color: '#4B5563' },
        })
        const __inertia_render__ = (page) => __inertia_app__(page, __inertia_ssr_render__)
        __inertia_createServer__(__inertia_render__)
        export default __inertia_render__

        initializeTheme()"
      `)
    })
  })
})
