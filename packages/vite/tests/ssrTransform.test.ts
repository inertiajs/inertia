import { describe, expect, it } from 'vitest'
import { findInertiaAppExport, wrapWithServerBootstrap } from '../src/ssrTransform'

describe('SSR Transform', () => {
  describe('findInertiaAppExport', () => {
    it('finds configureInertiaApp call', () => {
      const code = `configureInertiaApp({ resolve: name => name })`

      expect(findInertiaAppExport(code)).toBe(true)
    })

    it('finds createInertiaApp call', () => {
      const code = `createInertiaApp({ resolve: name => name })`

      expect(findInertiaAppExport(code)).toBe(true)
    })

    it('returns false for other function calls', () => {
      const code = `someOtherFunction({})`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('returns false for invalid code', () => {
      const code = `{{{ invalid syntax`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('returns false for export default (not supported)', () => {
      const code = `export default configureInertiaApp({})`

      expect(findInertiaAppExport(code)).toBe(false)
    })

    it('handles multiline code with imports', () => {
      const code = `
import { configureInertiaApp } from '@inertiajs/vue3'

configureInertiaApp({
  resolve: (name) => {
    return import(\`./Pages/\${name}.vue\`)
  },
})
`

      expect(findInertiaAppExport(code)).toBe(true)
    })
  })

  describe('wrapWithServerBootstrap', () => {
    it('wraps configureInertiaApp with server bootstrap', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/svelte'
configureInertiaApp({ resolve: (name) => name })`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import __inertia_createServer__ from '@inertiajs/core/server'")
      expect(result).toContain('const __inertia_app__ = await configureInertiaApp({ resolve: (name) => name })')
      expect(result).toContain('__inertia_createServer__(__inertia_render__)')
      expect(result).toContain('export default __inertia_render__')
    })

    it('includes port and cluster config', () => {
      const code = `configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, { port: 13715, cluster: true })

      expect(result).toContain('__inertia_createServer__(__inertia_render__, {"port":13715,"cluster":true})')
    })

    it('only includes provided config options', () => {
      const code = `configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, { port: 13715 })

      expect(result).toContain('__inertia_createServer__(__inertia_render__, {"port":13715})')
      expect(result).not.toContain('cluster')
    })

    it('preserves surrounding code', () => {
      const code = `import Something from 'somewhere'

configureInertiaApp({})

// Some comment`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import Something from 'somewhere'")
      expect(result).toContain('// Some comment')
    })

    it('returns null for non-Inertia calls', () => {
      const code = `someOtherFunction({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toBeNull()
    })

    it('injects React server renderer', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/react'
configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import { renderToString as __inertia_renderToString__ } from 'react-dom/server'")
      expect(result).toContain('const __inertia_render__ = (page) => __inertia_app__(page, __inertia_renderToString__)')
    })

    it('injects Vue server renderer', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/vue3'
configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).toContain("import { renderToString as __inertia_renderToString__ } from 'vue/server-renderer'")
      expect(result).toContain('const __inertia_render__ = (page) => __inertia_app__(page, __inertia_renderToString__)')
    })

    it('does not inject renderer for Svelte', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/svelte'
configureInertiaApp({})`
      const result = wrapWithServerBootstrap(code, {})

      expect(result).not.toContain('__inertia_renderToString__')
      expect(result).toContain('__inertia_createServer__(__inertia_render__)')
    })
  })
})
