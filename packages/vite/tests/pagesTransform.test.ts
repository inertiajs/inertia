import { describe, expect, it } from 'vitest'
import { transformPageResolution } from '../src/pagesTransform'

describe('Pages Transform', () => {
  describe('basic transformation', () => {
    it('returns null for code without InertiaApp', () => {
      const code = `const foo = 'bar'`
      expect(transformPageResolution(code)).toBeNull()
    })

    it('returns null for invalid syntax', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3' {{{ invalid`
      expect(transformPageResolution(code)).toBeNull()
    })

    it('returns null for unknown framework', () => {
      const code = `
        import { createInertiaApp } from 'unknown-package'
        export default createInertiaApp({ pages: './Pages' })
      `
      expect(transformPageResolution(code)).toBeNull()
    })

    it('returns null when resolve already specified', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: (name) => name })
      `
      expect(transformPageResolution(code)).toBeNull()
    })
  })

  describe('default resolver injection', () => {
    it('injects default resolver for empty call', () => {
      const code = `
        import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp()
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain("'./pages/**/*.vue'")
      expect(result).toContain("'./Pages/**/*.vue'")
    })

    it('injects default resolver for empty object', () => {
      const code = `
        import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp({})
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain('./pages/')
      expect(result).toContain('./Pages/')
    })

    it('injects default resolver with other options', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ title: t => t })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain('title: t => t')
    })

    it('uses correct extensions for React', () => {
      const code = `
        import { configureInertiaApp } from '@inertiajs/react'
        export default configureInertiaApp()
      `
      const result = transformPageResolution(code)

      expect(result).toContain('.tsx')
      expect(result).toContain('.jsx')
    })

    it('checks both ./pages and ./Pages directories', () => {
      const code = `
        import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp()
      `
      const result = transformPageResolution(code)

      expect(result).toContain('./pages/${name}.vue')
      expect(result).toContain('./Pages/${name}.vue')
    })
  })

  describe('framework detection', () => {
    it('uses .vue extension for Vue', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: './Pages' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('.vue')
    })

    it('uses .tsx/.jsx extensions for React', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ pages: './Pages' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('.tsx')
      expect(result).toContain('.jsx')
    })

    it('uses .svelte extension for Svelte', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/svelte'
        export default createInertiaApp({ pages: './Pages' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('.svelte')
    })
  })

  describe('pages: string', () => {
    it('transforms string path', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: './Pages' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain("import.meta.glob('./Pages/**/*.vue')")
      expect(result).toContain('./Pages/${name}.vue')
    })

    it('transforms template literal path', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: \`./Pages\` })
      `
      const result = transformPageResolution(code)

      expect(result).toContain("import.meta.glob('./Pages/**/*.vue')")
    })

    it('strips trailing slash', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: './Pages/' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('./Pages/${name}.vue')
      expect(result).not.toContain('./Pages//')
    })
  })

  describe('pages: object', () => {
    it('transforms object with path', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: { path: './Views' } })
      `
      const result = transformPageResolution(code)

      expect(result).toContain("import.meta.glob('./Views/**/*.vue')")
    })

    it('transforms with custom extension string', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ pages: { path: './Pages', extension: '.tsx' } })
      `
      const result = transformPageResolution(code)

      expect(result).toContain("import.meta.glob('./Pages/**/*.tsx')")
      expect(result).not.toContain('.jsx')
    })

    it('transforms with extension array', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ pages: { path: './Pages', extension: ['.tsx', '.ts'] } })
      `
      const result = transformPageResolution(code)

      expect(result).toContain("import.meta.glob('./Pages/**/*{.tsx,.ts}')")
    })

    it('transforms with transform function', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          pages: {
            path: './Pages',
            transform: (name) => name.replace('/', '-')
          }
        })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('const resolvedName = ')
      expect(result).toContain("(name) => name.replace('/', '-')")
    })

    it('transforms with arrow function transform', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          pages: {
            path: './Pages',
            transform: name => name.toLowerCase()
          }
        })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('const resolvedName = ')
      expect(result).toContain('name => name.toLowerCase()')
    })
  })

  describe('preserves other properties', () => {
    it('keeps other config options', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          pages: './Pages',
          title: (title) => \`My App - \${title}\`,
          progress: { color: 'red' },
        })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
      expect(result).toContain('title: (title)')
      expect(result).toContain("progress: { color: 'red' }")
    })

    it('preserves surrounding code', () => {
      const code = `
        // Header comment
        import { createInertiaApp } from '@inertiajs/vue3'

        const config = { color: 'blue' }

        export default createInertiaApp({
          pages: './Pages',
          progress: config,
        })

        // Footer comment
      `
      const result = transformPageResolution(code)

      expect(result).toContain('// Header comment')
      expect(result).toContain("const config = { color: 'blue' }")
      expect(result).toContain('// Footer comment')
    })
  })

  describe('works with both function names', () => {
    it('transforms configureInertiaApp', () => {
      const code = `
        import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp({ pages: './Pages' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
    })

    it('transforms createInertiaApp', () => {
      const code = `
        import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ pages: './Pages' })
      `
      const result = transformPageResolution(code)

      expect(result).toContain('resolve: async (name)')
    })
  })
})
