import { describe, expect, it } from 'vitest'
import { transformPageResolution } from '../src/pagesTransform'

describe('Pages Transform', () => {
  describe('returns null when no transform needed', () => {
    it('no InertiaApp in code', () => {
      expect(transformPageResolution(`const foo = 'bar'`)).toBeNull()
    })

    it('invalid syntax', () => {
      expect(transformPageResolution(`import { createInertiaApp } from '@inertiajs/vue3' {{{ invalid`)).toBeNull()
    })

    it('unknown framework', () => {
      const code = `import { createInertiaApp } from 'unknown-package'
export default createInertiaApp({ pages: './Pages' })`

      expect(transformPageResolution(code)).toBeNull()
    })

    it('resolve already specified', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ resolve: (name) => name })`

      expect(transformPageResolution(code)).toBeNull()
    })
  })

  describe('pages: string', () => {
    it('transforms for Vue', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: './Pages' })`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*.vue')
            const page = await (pages[\`./Pages/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('transforms for React', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
export default createInertiaApp({ pages: './Pages' })`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*{.tsx,.jsx}')
            const page = await (pages[\`./Pages/\${name}.tsx\`] || pages[\`./Pages/\${name}.jsx\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('transforms for Svelte', () => {
      const code = `import { createInertiaApp } from '@inertiajs/svelte'
export default createInertiaApp({ pages: './Pages' })`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/svelte'
        export default createInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*.svelte')
            const page = await (pages[\`./Pages/\${name}.svelte\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('strips trailing slash', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: './Pages/' })`

      expect(transformPageResolution(code)).toContain('./Pages/${name}.vue')
      expect(transformPageResolution(code)).not.toContain('./Pages//')
    })
  })

  describe('pages: object', () => {
    it('transforms with custom path', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: { path: './Views' } })`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob('./Views/**/*.vue')
            const page = await (pages[\`./Views/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('transforms with custom extension', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
export default createInertiaApp({ pages: { path: './Pages', extension: '.tsx' } })`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*.tsx')
            const page = await (pages[\`./Pages/\${name}.tsx\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('transforms with extension array', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
export default createInertiaApp({ pages: { path: './Pages', extension: ['.tsx', '.ts'] } })`

      expect(transformPageResolution(code)).toContain("import.meta.glob('./Pages/**/*{.tsx,.ts}')")
    })

    it('transforms with transform function', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({
  pages: {
    path: './Pages',
    transform: (name) => name.replace('/', '-')
  }
})`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          resolve: async (name) => {
            const resolvedName = ((name) => name.replace('/', '-'))(name)
            const pages = import.meta.glob('./Pages/**/*.vue')
            const page = await (pages[\`./Pages/\${resolvedName}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          }
        })"
      `)
    })
  })

  describe('default resolver injection', () => {
    it('injects for empty call', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/vue3'
export default configureInertiaApp()`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'])
            const page = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('injects for empty object', () => {
      const code = `import { configureInertiaApp } from '@inertiajs/vue3'
export default configureInertiaApp({})`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { configureInertiaApp } from '@inertiajs/vue3'
        export default configureInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'])
            const page = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          } })"
      `)
    })

    it('injects alongside other options', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ title: t => t })`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'])
            const page = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          }, title: t => t })"
      `)
    })
  })

  describe('preserves surrounding code', () => {
    it('keeps other config options', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({
  pages: './Pages',
  title: (title) => \`My App - \${title}\`,
  progress: { color: 'red' },
})`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*.vue')
            const page = await (pages[\`./Pages/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          },
          title: (title) => \`My App - \${title}\`,
          progress: { color: 'red' },
        })"
      `)
    })

    it('keeps code before and after', () => {
      const code = `// Header comment
import { createInertiaApp } from '@inertiajs/vue3'

const config = { color: 'blue' }

export default createInertiaApp({
  pages: './Pages',
  progress: config,
})

// Footer comment`

      expect(transformPageResolution(code)).toMatchInlineSnapshot(`
        "// Header comment
        import { createInertiaApp } from '@inertiajs/vue3'

        const config = { color: 'blue' }

        export default createInertiaApp({
          resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*.vue')
            const page = await (pages[\`./Pages/\${name}.vue\`])?.()
            if (!page) throw new Error(\`Page not found: \${name}\`)
            return page.default ?? page
          },
          progress: config,
        })

        // Footer comment"
      `)
    })
  })
})
