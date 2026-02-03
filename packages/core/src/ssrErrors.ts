/**
 * SSR Error Classification for Production Server
 *
 * This module detects common SSR errors and provides helpful hints
 * to developers on how to fix them.
 */

export type SSRErrorType = 'browser-api' | 'component-resolution' | 'render' | 'unknown'

type SourceMapResolver = (
  file: string,
  line: number,
  column: number,
) => { file: string; line: number; column: number } | null

let sourceMapResolver: SourceMapResolver | null = null

export function setSourceMapResolver(resolver: SourceMapResolver): void {
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
  window: 'The global window object',
  document: 'The DOM document object',
  localStorage: 'Browser local storage',
  sessionStorage: 'Browser session storage',
  navigator: 'The navigator object',
  location: 'The location object',
  history: 'The browser history API',
  matchMedia: 'The matchMedia function',
  IntersectionObserver: 'The IntersectionObserver API',
  ResizeObserver: 'The ResizeObserver API',
  MutationObserver: 'The MutationObserver API',
  requestAnimationFrame: 'The requestAnimationFrame function',
  cancelAnimationFrame: 'The cancelAnimationFrame function',
  fetch: 'The fetch API',
  XMLHttpRequest: 'The XMLHttpRequest API',
  HTMLElement: 'HTML element constructors',
  CustomEvent: 'The CustomEvent constructor',
  getComputedStyle: 'The getComputedStyle function',
  addEventListener: 'Global event listeners',
  removeEventListener: 'Global event listeners',
  innerWidth: 'Browser viewport dimensions',
  innerHeight: 'Browser viewport dimensions',
  scrollTo: 'Browser scroll functions',
  scrollBy: 'Browser scroll functions',
  alert: 'Browser alert dialog',
  confirm: 'Browser confirm dialog',
  prompt: 'Browser prompt dialog',
}

function detectBrowserApi(error: Error): string | null {
  const message = error.message.toLowerCase()

  for (const api of Object.keys(BROWSER_APIS)) {
    const patterns = [
      `${api.toLowerCase()} is not defined`,
      `'${api.toLowerCase()}' is not defined`,
      `"${api.toLowerCase()}" is not defined`,
      `cannot read properties of undefined (reading '${api.toLowerCase()}')`,
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

function getBrowserApiHint(api: string): string {
  const apiDescription = BROWSER_APIS[api] || `The "${api}" object`

  return (
    `${apiDescription} doesn't exist in Node.js. ` +
    `Wrap browser-specific code in a onMounted/useEffect/onMount lifecycle hook, ` +
    `or check "typeof ${api} !== 'undefined'" before using it.`
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

      // Try to resolve through sourcemap
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
      hint: `Could not resolve component${component ? ` "${component}"` : ''}. Check that the file exists and the path is correct.`,
    }
  }

  return {
    ...base,
    type: 'render',
    hint: 'An error occurred while rendering. Check for browser-specific code that runs during initialization.',
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

function makeRelative(path: string): string {
  const cwd = process.cwd()

  if (path.startsWith(cwd + '/')) {
    return path.slice(cwd.length + 1)
  }

  return path
}

export function formatConsoleError(classified: ClassifiedSSRError): string {
  const componentPart = classified.component ? `  ${colors.cyan}${classified.component}${colors.reset}` : ''

  const lines = [
    '',
    `  ${colors.bgRed}${colors.white}${colors.bold} SSR ERROR ${colors.reset}${componentPart}`,
    '',
    `  ${classified.error}`,
  ]

  if (classified.sourceLocation) {
    const relativePath = makeRelative(classified.sourceLocation)
    lines.push(`  ${colors.dim}Source: ${relativePath}${colors.reset}`)
  }

  if (classified.url) {
    lines.push(`  ${colors.dim}URL: ${classified.url}${colors.reset}`)
  }

  lines.push('', `  ${colors.yellow}Hint${colors.reset}  ${classified.hint}`, '')

  return lines.join('\n')
}
