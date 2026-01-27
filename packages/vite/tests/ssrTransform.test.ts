import { describe, expect, it } from 'vitest'
import { findInertiaAppExport, wrapWithServerBootstrap } from '../src/ssrTransform'

describe('SSR Transform', () => {
  describe('findInertiaAppExport', () => {
    it('finds configureInertiaApp export', () => {
      const code = `export default configureInertiaApp({ resolve: name => name })`

      expect(findInertiaAppExport(code)).toBe(true)
    })

    it('finds createInertiaApp export', () => {
      const code = `export default createInertiaApp({ resolve: name => name })`

      expect(findInertiaAppExport(code)).toBe(true)
    })

    it('finds await-wrapped configureInertiaApp export', () => {
      const code = `export default await configureInertiaApp({ resolve: name => name })`

      expect(findInertiaAppExport(code)).toBe(true)
    })

    it('returns false for other default exports', () => {
      const code = `export default someOtherFunction({})`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('returns false for default exports without function calls', () => {
      const code = `export default { foo: 'bar' }`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('returns false for invalid code', () => {
      const code = `export default {{{ invalid syntax`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('returns false when no default export exists', () => {
      const code = `export const config = { foo: 'bar' }`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('handles multiline code', () => {
      const code = `
import { configureInertiaApp } from '@inertiajs/vue3'

export default configureInertiaApp({
  resolve: (name) => {
    return import(\`./Pages/\${name}.vue\`)
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
`

      expect(findInertiaAppExport(code)).toBe(true)
    })
  })

  describe('wrapWithServerBootstrap', () => {
    it('wraps configureInertiaApp with server bootstrap', () => {
      const code = `export default configureInertiaApp({ resolve: (name) => name })`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import __inertia_createServer__ from '@inertiajs/core/server'")
      expect(result).toContain('const __inertia_render__ = await configureInertiaApp({ resolve: (name) => name })')
      expect(result).toContain('__inertia_createServer__(__inertia_render__)')
      expect(result).toContain('export default __inertia_render__')
    })

    it('includes port and cluster config', () => {
      const code = `export default configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, { port: 13715, cluster: true })

      expect(result).toContain('__inertia_createServer__(__inertia_render__, {"port":13715,"cluster":true})')
    })

    it('only includes provided config options', () => {
      const code = `export default configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, { port: 13715 })

      expect(result).toContain('__inertia_createServer__(__inertia_render__, {"port":13715})')
      expect(result).not.toContain('cluster')
    })

    it('preserves surrounding code', () => {
      const code = `import Something from 'somewhere'

export default configureInertiaApp({})

// Some comment`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import Something from 'somewhere'")
      expect(result).toContain('// Some comment')
    })

    it('returns null for non-Inertia exports', () => {
      const code = `export default someOtherFunction({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toBeNull()
    })

    it('handles already-awaited exports', () => {
      const code = `export default await configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain('const __inertia_render__ = await configureInertiaApp({})')
    })

    it('injects React server renderer', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/react'
export default configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import { renderToString as __inertia_renderToString__ } from 'react-dom/server'")
      expect(result).toContain('(page) => __inertia_render__(page, __inertia_renderToString__)')
    })

    it('injects Vue server renderer', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/vue3'
export default configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import { renderToString as __inertia_renderToString__ } from 'vue/server-renderer'")
      expect(result).toContain('(page) => __inertia_render__(page, __inertia_renderToString__)')
    })

    it('does not inject renderer for Svelte', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/svelte'
export default configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).not.toContain('__inertia_renderToString__')
      expect(result).toContain('__inertia_createServer__(__inertia_render__)')
    })
  })
})
