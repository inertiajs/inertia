export interface PagesOptions {
  path: string
  extension?: string | string[]
  transform?: (name: string) => string
}

export function pages(pathOrOptions: string | PagesOptions): string | PagesOptions {
  return pathOrOptions
}

const frameworkExtensions: Record<string, string[]> = {
  '@inertiajs/vue3': ['.vue'],
  '@inertiajs/react': ['.tsx', '.jsx'],
  '@inertiajs/svelte': ['.svelte'],
}

const defaultPagesDirectory = './pages'

export function transformPageResolution(code: string): string | null {
  if (!usesInertia(code)) {
    return null
  }

  let result = code

  if (containsPagesCall(code)) {
    result = transformPagesCalls(result)
  }

  if (needsDefaultResolver(result)) {
    result = injectDefaultResolver(result)
  }

  return result !== code ? result : null
}

function usesInertia(code: string): boolean {
  return code.includes('InertiaApp') || code.includes('pages(')
}

function containsPagesCall(code: string): boolean {
  return code.includes('pages(')
}

function needsDefaultResolver(code: string): boolean {
  return code.includes('InertiaApp') && !code.includes('resolve')
}

function transformPagesCalls(code: string): string {
  const framework = detectFramework(code)

  if (!framework) {
    return code
  }

  return code.replace(/pages\([^)]+\)/g, (match) => {
    const config = evaluatePagesCall(match, frameworkExtensions[framework])
    return config ? buildResolver(config) : match
  })
}

function injectDefaultResolver(code: string): string {
  const framework = detectFramework(code)

  if (!framework) {
    return code
  }

  const resolver = buildResolver({
    directory: defaultPagesDirectory,
    extensions: frameworkExtensions[framework],
  })

  const replacements: [RegExp, string][] = [
    [/(\w+InertiaApp)\(\s*\)/, `$1({ ${resolver} })`],
    [/(\w+InertiaApp)\(\s*\{\s*\}\s*\)/, `$1({ ${resolver} })`],
    [/(\w+InertiaApp)\(\s*\{/, `$1({ ${resolver},`],
  ]

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(code)) {
      return code.replace(pattern, replacement)
    }
  }

  return code
}

interface ResolverConfig {
  directory: string
  extensions: string[]
  transform?: string
}

function evaluatePagesCall(call: string, defaultExtensions: string[]): ResolverConfig | null {
  try {
    const result = new Function('pages', `return ${call}`)(pages) as string | PagesOptions

    if (typeof result === 'string') {
      return {
        directory: withoutTrailingSlash(result),
        extensions: defaultExtensions,
      }
    }

    if (isObject(result) && result.path) {
      return {
        directory: withoutTrailingSlash(result.path),
        extensions: normalizeExtensions(result.extension, defaultExtensions),
        transform: result.transform?.toString(),
      }
    }

    return null
  } catch {
    return null
  }
}

function buildResolver({ directory, extensions, transform }: ResolverConfig): string {
  const glob = buildGlobPattern(directory, extensions)
  const lookup = buildLookupExpression(directory, extensions, !!transform)
  const nameTransform = transform ? `const resolvedName = (${transform})(name)\n    ` : ''

  return `resolve: async (name) => {
    ${nameTransform}const pages = import.meta.glob('${glob}')
    const resolver = ${lookup}
    if (!resolver) {
      throw new Error(\`Page not found: \${name}\`)
    }
    const page = await resolver()
    return page.default || page
  }`
}

function buildGlobPattern(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}

function buildLookupExpression(directory: string, extensions: string[], hasTransform: boolean): string {
  const name = hasTransform ? 'resolvedName' : 'name'

  if (extensions.length === 1) {
    return `pages[\`${directory}/\${${name}}${extensions[0]}\`]`
  }

  return extensions.map((ext) => `pages[\`${directory}/\${${name}}${ext}\`]`).join(' || ')
}

function detectFramework(code: string): string | null {
  return Object.keys(frameworkExtensions).find((fw) => code.includes(fw)) ?? null
}

function normalizeExtensions(extension: string | string[] | undefined, defaults: string[]): string[] {
  if (!extension) {
    return defaults
  }

  return Array.isArray(extension) ? extension : [extension]
}

function withoutTrailingSlash(path: string): string {
  return path.replace(/\/$/, '')
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
