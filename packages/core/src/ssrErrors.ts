/**
 * SSR Error Classification
 *
 * This module detects common SSR errors and provides helpful hints
 * to developers on how to fix them. The most common issue is using
 * browser-specific APIs (like window, document) that don't exist
 * in the Node.js server environment.
 */

export type SSRErrorType = 'browser-api' | 'component-resolution' | 'render' | 'unknown'

type SourceMapResolver = (
  file: string,
  line: number,
  column: number,
) => { file: string; line: number; column: number } | null

let sourceMapResolver: SourceMapResolver | null = null

export function setSourceMapResolver(resolver: SourceMapResolver | null): void {
  sourceMapResolver = resolver
}

export interface ClassifiedSSRError {
  error: string
  type: SSRErrorType
  component?: string
  url?: string
  browserApi?: string
  hint: string
  stack?: string
  sourceLocation?: string
  timestamp: string
}

const BROWSER_APIS: Record<string, string> = {
  // Global objects
  window: 'The global window object',
  document: 'The DOM document object',
  navigator: 'The navigator object',
  location: 'The location object',
  history: 'The browser history API',
  screen: 'The screen object',
  localStorage: 'Browser local storage',
  sessionStorage: 'Browser session storage',

  // Viewport properties (accessed via window.X)
  innerWidth: 'Browser viewport width',
  innerHeight: 'Browser viewport height',
  outerWidth: 'Browser window width',
  outerHeight: 'Browser window height',
  scrollX: 'Horizontal scroll position',
  scrollY: 'Vertical scroll position',
  devicePixelRatio: 'The device pixel ratio',
  matchMedia: 'The matchMedia function',

  // Observers (commonly instantiated at module level)
  IntersectionObserver: 'The IntersectionObserver API',
  ResizeObserver: 'The ResizeObserver API',
  MutationObserver: 'The MutationObserver API',

  // Timing functions (commonly called at module level)
  requestAnimationFrame: 'The requestAnimationFrame function',
  requestIdleCallback: 'The requestIdleCallback function',

  // Constructors that might be used at module level
  Image: 'The Image constructor',
  Audio: 'The Audio constructor',
  Worker: 'The Worker constructor',
  BroadcastChannel: 'The BroadcastChannel constructor',

  // Network (older Node.js versions)
  fetch: 'The fetch API',
  XMLHttpRequest: 'The XMLHttpRequest API',
}

function detectBrowserApi(error: Error): string | null {
  const message = error.message.toLowerCase()

  for (const api of Object.keys(BROWSER_APIS)) {
    const patterns = [
      `${api.toLowerCase()} is not defined`,
      `'${api.toLowerCase()}' is not defined`,
      `"${api.toLowerCase()}" is not defined`,
      `cannot read properties of undefined (reading '${api.toLowerCase()}')`,
      `cannot read property '${api.toLowerCase()}'`,
    ]

    if (patterns.some((pattern) => message.includes(pattern))) {
      return api
    }
  }

  return null
}

function isComponentResolutionError(error: Error): boolean {
  const message = error.message.toLowerCase()

  return (
    message.includes('cannot find module') ||
    message.includes('failed to resolve') ||
    message.includes('module not found') ||
    message.includes('could not resolve')
  )
}

const LIFECYCLE_HOOKS = 'onMounted/useEffect/onMount'

function getBrowserApiHint(api: string): string {
  const apiDescription = BROWSER_APIS[api] || `The "${api}" object`

  if (['localStorage', 'sessionStorage'].includes(api)) {
    return (
      `${apiDescription} doesn't exist in Node.js. ` +
      `Check "typeof ${api} !== 'undefined'" before using it, ` +
      `or move the code to a ${LIFECYCLE_HOOKS} lifecycle hook.`
    )
  }

  if (['window', 'document'].includes(api)) {
    return (
      `${apiDescription} doesn't exist in Node.js. ` +
      `Wrap browser-specific code in a ${LIFECYCLE_HOOKS} lifecycle hook, ` +
      `or check "typeof ${api} !== 'undefined'" before using it.`
    )
  }

  if (['IntersectionObserver', 'ResizeObserver', 'MutationObserver'].includes(api)) {
    return (
      `${apiDescription} doesn't exist in Node.js. ` +
      `Create observers inside a ${LIFECYCLE_HOOKS} lifecycle hook, not at the module level.`
    )
  }

  if (['fetch', 'XMLHttpRequest'].includes(api)) {
    return (
      `${apiDescription} may not be available in all Node.js versions. ` +
      `For SSR, ensure data fetching happens on the server (in your controller) ` +
      `and is passed as props, or use a ${LIFECYCLE_HOOKS} hook for client-side fetching.`
    )
  }

  return (
    `${apiDescription} doesn't exist in Node.js. ` +
    `Move this code to a ${LIFECYCLE_HOOKS} lifecycle hook, or guard it with ` +
    `"typeof ${api} !== 'undefined'".`
  )
}

function getComponentResolutionHint(component?: string): string {
  const componentPart = component ? ` "${component}"` : ''

  return (
    `Could not resolve component${componentPart}. ` +
    `Check that the file exists and the path is correct. ` +
    `Ensure the component name matches the file name exactly (case-sensitive).`
  )
}

function getRenderErrorHint(): string {
  return (
    'An error occurred while rendering the component. ' +
    'Check the component for browser-specific code that runs during initialization. ' +
    'Move any code that accesses browser APIs to a lifecycle hook.'
  )
}

function extractSourceLocation(stack?: string): string | undefined {
  if (!stack) {
    return undefined
  }

  for (const line of stack.split('\n')) {
    if (!line.includes('at ')) {
      continue
    }

    if (line.includes('node_modules') || line.includes('node:')) {
      continue
    }

    let match = line.match(/\(([^)]+):(\d+):(\d+)\)/)

    if (!match) {
      match = line.match(/at\s+(?:file:\/\/)?(.+):(\d+):(\d+)\s*$/)
    }

    if (match) {
      const file = match[1].replace(/^file:\/\//, '')
      const lineNum = parseInt(match[2], 10)
      const colNum = parseInt(match[3], 10)

      if (sourceMapResolver) {
        const resolved = sourceMapResolver(file, lineNum, colNum)

        if (resolved) {
          return `${resolved.file}:${resolved.line}:${resolved.column}`
        }
      }

      return `${file}:${lineNum}:${colNum}`
    }
  }

  return undefined
}

export function classifySSRError(error: Error, component?: string, url?: string): ClassifiedSSRError {
  const timestamp = new Date().toISOString()
  const base = {
    error: error.message,
    component,
    url,
    stack: error.stack,
    sourceLocation: extractSourceLocation(error.stack),
    timestamp,
  }

  const browserApi = detectBrowserApi(error)

  if (browserApi) {
    return {
      ...base,
      type: 'browser-api',
      browserApi,
      hint: getBrowserApiHint(browserApi),
    }
  }

  if (isComponentResolutionError(error)) {
    return {
      ...base,
      type: 'component-resolution',
      hint: getComponentResolutionHint(component),
    }
  }

  return {
    ...base,
    type: 'render',
    hint: getRenderErrorHint(),
  }
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m',
}

function makeRelative(path: string, root?: string): string {
  const base = root ?? process.cwd()

  if (path.startsWith(base + '/')) {
    return path.slice(base.length + 1)
  }

  return path
}

export function formatConsoleError(
  classified: ClassifiedSSRError,
  root?: string,
  handleErrors: boolean = true,
  suppressedWarnings: string[] = [],
): string {
  if (!handleErrors) {
    const component = classified.component ? `[${classified.component}]` : ''
    return `SSR Error ${component}: ${classified.error}`
  }

  const componentPart = classified.component ? `  ${colors.cyan}${classified.component}${colors.reset}` : ''

  const lines = [
    '',
    `  ${colors.bgRed}${colors.white}${colors.bold} SSR ERROR ${colors.reset}${componentPart}`,
    '',
    `  ${classified.error}`,
  ]

  if (classified.sourceLocation) {
    const relativePath = makeRelative(classified.sourceLocation, root)
    lines.push(`  ${colors.dim}Source: ${relativePath}${colors.reset}`)
  }

  if (classified.url) {
    lines.push(`  ${colors.dim}URL: ${classified.url}${colors.reset}`)
  }

  lines.push('', `  ${colors.yellow}Hint${colors.reset}  ${classified.hint}`, '')

  if (classified.stack) {
    lines.push(`  ${colors.dim}${classified.stack.split('\n').join('\n  ')}${colors.reset}`, '')
  }

  if (suppressedWarnings.length > 0) {
    lines.push(`  ${colors.dim}Suppressed ${suppressedWarnings.length} framework warning(s).${colors.reset}`, '')
  }

  return lines.join('\n')
}
