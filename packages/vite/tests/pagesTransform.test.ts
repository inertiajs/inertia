import { describe, expect, it } from 'vitest'
import { defaultFrameworks } from '../src/frameworks/index'
import { transformPageResolution } from '../src/pagesTransform'

const transform = (code: string) => transformPageResolution(code, defaultFrameworks)

describe('Pages Transform', () => {
  describe('returns null when no transform needed', () => {
    it('no InertiaApp in code', () => {
      expect(transform(`const foo = 'bar'`)).toBeNull()
    })

    it('invalid syntax', () => {
      expect(transform(`import { createInertiaApp } from '@inertiajs/vue3' {{{ invalid`)).toBeNull()
    })

    it('unknown framework', () => {
      const code = `import { createInertiaApp } from 'unknown-package'
export default createInertiaApp({ pages: './Pages' })`

      expect(transform(code)).toBeNull()
    })

    it('resolve already specified', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ resolve: (name) => name })`

      expect(transform(code)).toBeNull()
    })
  })

  describe('pages: string', () => {
    it('transforms for Vue', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: './Pages' })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob('./Pages/**/*.vue', { eager: false })
            const module = await (pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })

    it('transforms for React', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
export default createInertiaApp({ pages: './Pages' })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob('./Pages/**/*{.tsx,.jsx}', { eager: false })
            const module = await (pages[\`./Pages/\${name}.tsx\`] || pages[\`./Pages/\${name}.jsx\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })

    it('transforms for Svelte', () => {
      const code = `import { createInertiaApp } from '@inertiajs/svelte'
export default createInertiaApp({ pages: './Pages' })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/svelte'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob('./Pages/**/*.svelte', { eager: false })
            const module = await (pages[\`./Pages/\${name}.svelte\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module
          } })"
      `)
    })

    it('strips trailing slash', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: './Pages/' })`

      expect(transform(code)).toContain('./Pages/${name}.vue')
      expect(transform(code)).not.toContain('./Pages//')
    })
  })

  describe('pages: object', () => {
    it('transforms with custom path', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: { path: './Views' } })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob('./Views/**/*.vue', { eager: false })
            const module = await (pages[\`./Views/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })

    it('transforms with custom extension', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
export default createInertiaApp({ pages: { path: './Pages', extension: '.tsx' } })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/react'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob('./Pages/**/*.tsx', { eager: false })
            const module = await (pages[\`./Pages/\${name}.tsx\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })

    it('transforms with extension array', () => {
      const code = `import { createInertiaApp } from '@inertiajs/react'
export default createInertiaApp({ pages: { path: './Pages', extension: ['.tsx', '.ts'] } })`

      expect(transform(code)).toContain("import.meta.glob('./Pages/**/*{.tsx,.ts}', { eager: false })")
    })

    it('transforms with transform function', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({
  pages: {
    path: './Pages',
    transform: (name) => name.replace('/', '-')
  }
})`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          resolve: async (name, page) => {
            const resolvedName = ((name) => name.replace('/', '-'))(name, page)
            const pages = import.meta.glob('./Pages/**/*.vue', { eager: false })
            const module = await (pages[\`./Pages/\${resolvedName}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          }
        })"
      `)
    })

    it('transforms with lazy: true and no path', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ pages: { lazy: true } })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'], { eager: false })
            const module = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })
  })

  describe('default resolver injection', () => {
    it('injects for empty call', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp()`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'], { eager: false })
            const module = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })

    it('injects for empty object', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({})`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'], { eager: false })
            const module = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          } })"
      `)
    })

    it('injects alongside other options', () => {
      const code = `import { createInertiaApp } from '@inertiajs/vue3'
export default createInertiaApp({ title: t => t })`

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({ resolve: async (name, page) => {
            const pages = import.meta.glob(['./pages/**/*.vue', './Pages/**/*.vue'], { eager: false })
            const module = await (pages[\`./pages/\${name}.vue\`] || pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
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

      expect(transform(code)).toMatchInlineSnapshot(`
        "import { createInertiaApp } from '@inertiajs/vue3'
        export default createInertiaApp({
          resolve: async (name, page) => {
            const pages = import.meta.glob('./Pages/**/*.vue', { eager: false })
            const module = await (pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
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

      expect(transform(code)).toMatchInlineSnapshot(`
        "// Header comment
        import { createInertiaApp } from '@inertiajs/vue3'

        const config = { color: 'blue' }

        export default createInertiaApp({
          resolve: async (name, page) => {
            const pages = import.meta.glob('./Pages/**/*.vue', { eager: false })
            const module = await (pages[\`./Pages/\${name}.vue\`])?.()
            if (!module) throw new Error(\`Page not found: \${name}\`)
            return module.default ?? module
          },
          progress: config,
        })

        // Footer comment"
      `)
    })
  })
})
