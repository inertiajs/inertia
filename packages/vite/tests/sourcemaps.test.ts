import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { SourceMap } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import inertia from '../src'

function position(code: string, marker: string) {
  const offset = code.indexOf(marker)
  expect(offset, `Missing marker: ${marker}`).toBeGreaterThanOrEqual(0)
  const lines = code.slice(0, offset).split('\n')

  return { line: lines.length - 1, column: lines.at(-1)!.length }
}

function expectOriginalPosition(original: string, generated: string, map: SourceMap, marker: string) {
  const expected = position(original, marker)
  const actual = position(generated, marker)
  const entry = map.findEntry(actual.line, actual.column)

  expect(entry.originalSource).toMatch(/app\.[jt]s$/)
  expect(entry.originalLine, marker).toBe(expected.line)
  expect(entry.originalColumn, marker).toBe(expected.column)
}

async function transform(code: string, ssr: boolean) {
  const result = await inertia().transform!(code, '/src/app.ts', { ssr })

  expect(result).toHaveProperty('map')

  if (!result || typeof result === 'string' || !result.map) {
    throw new Error('Expected transformed code with a sourcemap')
  }

  const map = typeof result.map === 'string' ? JSON.parse(result.map) : result.map
  expect(map.sourcesContent).toEqual([code])

  return { code: result.code, map: new SourceMap(map) }
}

describe.each(['react', 'vue3', 'svelte'])('%s sourcemaps', (framework) => {
  const importApp = `import { createInertiaApp } from '@inertiajs/${framework}'`

  it.each([false, true])('preserves positions around and inside automatic resolution (ssr: %s)', async (ssr) => {
    const code = `${importApp}
const before = () => console.log('before marker')
void createInertiaApp({
  title: (title) => {
    console.log('title marker')
    return title
  },
})
const after = () => console.log('after marker')`
    const result = await transform(code, ssr)

    for (const marker of [
      "console.log('before marker')",
      'createInertiaApp({',
      "console.log('title marker')",
      "console.log('after marker')",
    ]) {
      expectOriginalPosition(code, result.code, result.map, marker)
    }
  })

  it('preserves positions when only the SSR bootstrap changes', async () => {
    const code = `${importApp}
createInertiaApp({
  resolve: (name) => {
    console.log('resolve marker')
    return name
  },
})
console.log('after marker')`
    const result = await transform(code, true)

    for (const marker of ["console.log('resolve marker')", "console.log('after marker')"]) {
      expectOriginalPosition(code, result.code, result.map, marker)
    }
  })

  it.each([false, true])('preserves the pages.transform expression (ssr: %s)', async (ssr) => {
    const code = `${importApp}
createInertiaApp({
  pages: {
    path: './Pages',
    transform: (name) => {
      console.log('transform marker')
      return name.toLowerCase()
    },
  },
  title: (title) => title.toUpperCase(),
})
console.log('after marker')`
    const result = await transform(code, ssr)

    for (const marker of [
      "console.log('transform marker')",
      'name.toLowerCase()',
      'title.toUpperCase()',
      "console.log('after marker')",
    ]) {
      expectOriginalPosition(code, result.code, result.map, marker)
    }
  })

  it.each(['resolve', 'async'])('maps the user reference when pages.transform is %s', async (identifier) => {
    const code = `${importApp}
createInertiaApp({ pages: { transform: ${identifier} } })`

    for (const ssr of [false, true]) {
      const result = await transform(code, ssr)
      const original = position(code, `transform: ${identifier}`)
      const generated = position(result.code, `(${identifier})(name, page)`)
      const entry = result.map.findEntry(generated.line, generated.column + 1)

      expect(entry.originalLine).toBe(original.line)
      expect(entry.originalColumn).toBe(original.column + 'transform: '.length)
    }
  })

  it('preserves the legacy createServer callback and options', async () => {
    const code = `${importApp}
import createServer from '@inertiajs/${framework}/server'
console.log('before marker')
createServer((page) => createInertiaApp({
  page,
  pages: {
    transform: (name) => name.toLowerCase(),
  },
  setup: (options) => options.app,
}), {
  port: getPort(),
})

console.log('after marker')`
    const result = await transform(code, true)

    for (const marker of [
      "console.log('before marker')",
      '(page) =>',
      'name.toLowerCase()',
      'options.app',
      'getPort()',
      "console.log('after marker')",
    ]) {
      expectOriginalPosition(code, result.code, result.map, marker)
    }
  })

  it.each([false, true])('emits usable build sourcemaps without missing-map warnings (ssr: %s)', async (ssr) => {
    const root = mkdtempSync(join(tmpdir(), 'inertia-sourcemaps-'))
    const entry = join(root, 'app.js')
    const code = `${importApp}
export const before = () => beforeMarker()
createInertiaApp({
  pages: { transform: (name) => {
    transformMarker()
    return name.toLowerCase()
  } },
  title: (title) => {
    titleMarker()
    return title.toUpperCase()
  },
})
export const after = () => afterMarker()`
    writeFileSync(entry, code)
    const warnings: string[] = []

    try {
      const result = await build({
        configFile: false,
        root,
        logLevel: 'silent',
        plugins: [inertia()],
        build: {
          write: false,
          minify: false,
          sourcemap: true,
          ssr: ssr ? entry : false,
          rollupOptions: {
            input: entry,
            external: (id) => id.startsWith('@inertiajs/') || id.includes('/server'),
            preserveEntrySignatures: 'strict',
            onwarn: (warning) => warnings.push(warning.message),
          },
        },
      })

      expect(warnings.filter((warning) => /sourcemap/i.test(warning))).toEqual([])

      if (!('output' in result)) {
        throw new Error('Expected a single build output')
      }

      const chunk = result.output.find((output) => output.type === 'chunk' && output.isEntry)

      if (!chunk || chunk.type !== 'chunk' || !chunk.map) {
        throw new Error('Expected an entry chunk with a sourcemap')
      }

      const map = new SourceMap(JSON.parse(chunk.map.toString()))

      for (const marker of ['beforeMarker()', 'transformMarker()', 'titleMarker()', 'afterMarker()']) {
        expectOriginalPosition(code, chunk.code, map, marker)
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

it('maps an actual SSR call when a custom template also includes it in a comment', async () => {
  const code = `import { createInertiaApp } from '@inertiajs/custom'
createInertiaApp({ resolve: (name) => name })`
  const result = await inertia({
    frameworks: [
      {
        package: '@inertiajs/custom',
        extensions: ['.js'],
        ssr: (call) => `/* ${call} */\nconst render = ${call}`,
      },
    ],
  }).transform!(code, '/src/app.ts', { ssr: true })

  if (!result || typeof result === 'string' || !result.map) {
    throw new Error('Expected transformed code with a sourcemap')
  }

  const map = new SourceMap(typeof result.map === 'string' ? JSON.parse(result.map) : result.map)
  const generated = position(result.code, 'const render = createInertiaApp')
  const entry = map.findEntry(generated.line, generated.column + 'const render = '.length)

  expect(entry.originalLine).toBe(1)
  expect(entry.originalColumn).toBe(0)
})
