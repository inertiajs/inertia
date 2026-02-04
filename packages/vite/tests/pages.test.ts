import { describe, expect, it } from 'vitest'
import inertia from '../src'

describe('plugin', () => {
  it('has correct name', () => {
    expect(inertia().name).toBe('@inertiajs/vite')
  })
})

describe('pages property transform', () => {
  describe('string path', () => {
    it('transforms for Vue', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: './Pages' })
      `)

      expect(result).toContain('resolve: async (name, page)')
      expect(result).toContain("import.meta.glob('./Pages/**/*.vue', { eager: true })")
      expect(result).toContain('./Pages/${name}.vue')
    })

    it('transforms for React with tsx/jsx fallback', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ pages: './Pages' })
      `)

      expect(result).toContain("import.meta.glob('./Pages/**/*{.tsx,.jsx}', { eager: true })")
      expect(result).toContain('${name}.tsx')
      expect(result).toContain('${name}.jsx')
    })

    it('transforms for Svelte', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/svelte'
        export default createInertiaApp({ pages: './Pages' })
      `)

      expect(result).toContain("import.meta.glob('./Pages/**/*.svelte', { eager: true })")
      expect(result).toContain('${name}.svelte')
    })

    it('strips trailing slash', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: './Pages/' })
      `)

      expect(result).toContain('./Pages/${name}.vue')
      expect(result).not.toContain('./Pages//')
    })
  })

  describe('object config', () => {
    it('transforms with path', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: { path: './Custom' } })
      `)

      expect(result).toContain("import.meta.glob('./Custom/**/*.vue', { eager: true })")
      expect(result).toContain('./Custom/${name}.vue')
    })

    it('transforms with custom extension', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ pages: { path: './Pages', extension: '.jsx' } })
      `)

      expect(result).toContain("import.meta.glob('./Pages/**/*.jsx', { eager: true })")
      expect(result).toContain('./Pages/${name}.jsx')
      expect(result).not.toContain('.tsx')
    })

    it('transforms with transform function', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          pages: {
            path: './Pages',
            transform: (name) => name.replace('/', '-')
          }
        })
      `)

      expect(result).toContain('const resolvedName = ')
      expect(result).toContain('resolvedName')
    })
  })

  describe('default resolver injection', () => {
    it('injects default resolver for empty call', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp()
      `)

      expect(result).toContain('resolve: async (name, page)')
      expect(result).toContain('./pages/')
      expect(result).toContain('./Pages/')
    })

    it('injects default resolver for empty object', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({})
      `)

      expect(result).toContain('resolve: async (name, page)')
    })

    it('injects default resolver with other options', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ title: t => t })
      `)

      expect(result).toContain('resolve: async (name, page)')
      expect(result).toContain('title: t => t')
    })
  })

  describe('edge cases', () => {
    it('preserves other options', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          pages: './Pages',
          setup({ app }) { app.use(router) },
          progress: { color: 'red' },
        })
      `)

      expect(result).toContain('setup({ app })')
      expect(result).toContain("progress: { color: 'red' }")
    })

    it('does not transform non-JS files', () => {
      const plugin = inertia()
      const result = plugin.transform!("pages: './Pages'", 'app.vue')

      expect(result).toBeNull()
    })

    it('does not transform without Inertia import', () => {
      const result = transform(`const config = { pages: './Pages' }`)

      expect(result).toBeNull()
    })

    it('does not transform unknown framework', () => {
      const result = transform(`
        import { createInertiaApp } from 'some-other-package'
        export default createInertiaApp({ pages: './Pages' })
      `)

      expect(result).toBeNull()
    })

    it('does not transform when resolve already specified', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          resolve: (name) => import(\`./Pages/\${name}.vue\`)
        })
      `)

      expect(result).toBeNull()
    })
  })
})

function transform(code: string): string | null {
  const plugin = inertia()
  return plugin.transform!(code, 'app.ts') as string | null
}
