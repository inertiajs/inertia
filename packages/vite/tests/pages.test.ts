import { describe, expect, it } from 'vitest'
import inertia from '../src'

describe('plugin', () => {
  it('has correct name', () => {
    expect(inertia().name).toBe('@inertiajs/vite')
  })
})

describe('pages transform', () => {
  describe('pages() function', () => {
    it('transforms for Vue', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages('./Pages') })
      `)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain("import.meta.glob('./Pages/**/*.vue')")
      expect(result).toContain('./Pages/${name}.vue')
    })

    it('transforms for React with tsx/jsx fallback', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/react'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages('./Pages') })
      `)

      expect(result).toContain("import.meta.glob('./Pages/**/*{.tsx,.jsx}')")
      expect(result).toContain('${name}.tsx')
      expect(result).toContain('${name}.jsx')
    })

    it('transforms for Svelte', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/svelte'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages('./Pages') })
      `)

      expect(result).toContain("import.meta.glob('./Pages/**/*.svelte')")
      expect(result).toContain('${name}.svelte')
    })

    it('handles custom directory', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages('./src/views') })
      `)

      expect(result).toContain("import.meta.glob('./src/views/**/*.vue')")
      expect(result).toContain('./src/views/${name}.vue')
    })

    it('strips trailing slash', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages('./Pages/') })
      `)

      expect(result).toContain('./Pages/${name}.vue')
      expect(result).not.toContain('./Pages//')
    })

    it('transforms with path object', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages({ path: './Custom' }) })
      `)

      expect(result).toContain("import.meta.glob('./Custom/**/*.vue')")
      expect(result).toContain('./Custom/${name}.vue')
    })

    it('transforms with custom extension', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/react'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages({ path: './Pages', extension: '.jsx' }) })
      `)

      expect(result).toContain("import.meta.glob('./Pages/**/*.jsx')")
      expect(result).toContain('./Pages/${name}.jsx')
      expect(result).not.toContain('.tsx')
    })
  })

  describe('default resolver injection', () => {
    it('injects resolver when no resolve specified', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ title: (t) => t })
      `)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain("import.meta.glob('./pages/**/*.vue')")
    })

    it('injects resolver for empty config', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({})
      `)

      expect(result).toContain('resolve: async (name)')
    })

    it('injects resolver for no-arg call', () => {
      const result = transform(`
        import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp()
      `)

      expect(result).toContain('resolve: async (name)')
    })

    it('does not inject when resolve is specified', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: (name) => import(\`./Pages/\${name}.vue\`) })
      `)

      expect(result).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('preserves other options', () => {
      const result = transform(`
        import { createInertiaApp } from '@inertiajs/vue3'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({
          resolve: pages('./Pages'),
          setup({ app }) { app.use(router) },
          progress: { color: 'red' },
        })
      `)

      expect(result).toContain('setup({ app })')
      expect(result).toContain("progress: { color: 'red' }")
    })

    it('does not transform non-JS files', () => {
      const plugin = inertia()
      const result = plugin.transform!("pages('./Pages')", 'app.vue')

      expect(result).toBeNull()
    })

    it('does not transform without Inertia import', () => {
      const result = transform(`const config = { resolve: pages('./Pages') }`)

      expect(result).toBeNull()
    })

    it('does not transform unknown framework', () => {
      const result = transform(`
        import { createInertiaApp } from 'some-other-package'
        import { pages } from '@inertiajs/vite'
        export default createInertiaApp({ resolve: pages('./Pages') })
      `)

      expect(result).toBeNull()
    })
  })
})

function transform(code: string): string | null {
  const plugin = inertia()
  return plugin.transform!(code, 'app.ts') as string | null
}
