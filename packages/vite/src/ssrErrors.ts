/**
 * SSR Error Classification
 *
 * This module detects common SSR errors and provides helpful hints
 * to developers on how to fix them. The most common issue is using
 * browser-specific APIs (like window, document) that don't exist
 * in the Node.js server environment.
 */

import { BROWSER_APIS, type SSRErrorType, type ClassifiedSSRError } from '@inertiajs/core/server'

export { BROWSER_APIS, type SSRErrorType, type ClassifiedSSRError }

/**
 * Framework-specific lifecycle hook names for the hint messages.
 */
const LIFECYCLE_HOOKS: Record<string, string> = {
  vue: 'onMounted',
  react: 'useEffect',
  svelte: 'onMount',
}

/**
 * Detect which browser API is being accessed from an error message.
 *
 * Looks for patterns like:
 * - "window is not defined"
 * - "Cannot read property 'x' of undefined" (when accessing window.x)
 * - "ReferenceError: document is not defined"
 */
export function detectBrowserApi(error: Error): string | null {
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

/**
 * Check if the error is a component resolution error.
 */
export function isComponentResolutionError(error: Error): boolean {
  const message = error.message.toLowerCase()

  return (
    message.includes('cannot find module') ||
    message.includes('failed to resolve') ||
    message.includes('module not found') ||
    message.includes('could not resolve')
  )
}

/**
 * Generate a helpful hint for a browser API error.
 */
export function getBrowserApiHint(api: string): string {
  const apiDescription = BROWSER_APIS[api] || `The "${api}" object`
  const hooks = Object.values(LIFECYCLE_HOOKS).join('/')

  if (['localStorage', 'sessionStorage'].includes(api)) {
    return (
      `${apiDescription} doesn't exist in Node.js. ` +
      `Check "typeof ${api} !== 'undefined'" before using it, ` +
      `or move the code to a ${hooks} lifecycle hook.`
    )
  }

  if (['window', 'document'].includes(api)) {
    return (
      `${apiDescription} doesn't exist in Node.js. ` +
      `Wrap browser-specific code in a ${hooks} lifecycle hook, ` +
      `or check "typeof ${api} !== 'undefined'" before using it.`
    )
  }

  if (['IntersectionObserver', 'ResizeObserver', 'MutationObserver'].includes(api)) {
    return (
      `${apiDescription} doesn't exist in Node.js. ` +
      `Create observers inside a ${hooks} lifecycle hook, not at the module level.`
    )
  }

  if (['fetch', 'XMLHttpRequest'].includes(api)) {
    return (
      `${apiDescription} may not be available in all Node.js versions. ` +
      `For SSR, ensure data fetching happens on the server (in your controller) ` +
      `and is passed as props, or use a ${hooks} hook for client-side fetching.`
    )
  }

  return (
    `${apiDescription} doesn't exist in Node.js. ` +
    `Move this code to a ${hooks} lifecycle hook, or guard it with ` +
    `"typeof ${api} !== 'undefined'".`
  )
}

/**
 * Generate a hint for a component resolution error.
 */
export function getComponentResolutionHint(component?: string): string {
  const componentPart = component ? ` "${component}"` : ''

  return (
    `Could not resolve component${componentPart}. ` +
    `Check that the file exists and the path is correct. ` +
    `Ensure the component name matches the file name exactly (case-sensitive).`
  )
}

/**
 * Generate a hint for a general render error.
 */
export function getRenderErrorHint(): string {
  return (
    'An error occurred while rendering the component. ' +
    'Check the component for browser-specific code that runs during initialization. ' +
    'Move any code that accesses browser APIs to a lifecycle hook.'
  )
}

/**
 * Classify an SSR error and generate helpful debugging information.
 */
export function classifySSRError(error: Error, component?: string, url?: string): ClassifiedSSRError {
  const timestamp = new Date().toISOString()
  const base = {
    error: error.message,
    component,
    url,
    stack: error.stack,
    sourceLocation: extractSourceLocation(error.stack) ?? undefined,
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

/**
 * ANSI color codes for terminal output.
 */
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

/**
 * Extract the first relevant source location from a stack trace.
 * Skips node_modules and internal Node.js files.
 */
function extractSourceLocation(stack?: string): string | null {
  if (!stack) {
    return null
  }

  const lines = stack.split('\n')

  for (const line of lines) {
    // Skip lines that don't look like stack frames
    if (!line.includes('at ')) {
      continue
    }

    // Skip node_modules and internal files
    if (line.includes('node_modules') || line.includes('node:')) {
      continue
    }

    // Try multiple patterns for different stack trace formats
    // Format 1: "at functionName (/path/to/file.vue:10:5)" - with parentheses
    // Format 2: "at /path/to/file.vue:10:5" - without function name
    // Format 3: "at file:///path/to/file.vue:10:5" - with file:// protocol

    // Pattern for path with line:column inside parentheses
    let match = line.match(/\(([^)]+):(\d+):(\d+)\)/)

    if (match) {
      const path = match[1].replace(/^file:\/\//, '')

      return `${path}:${match[2]}:${match[3]}`
    }

    // Pattern for path with line:column without parentheses
    match = line.match(/at\s+(?:file:\/\/)?(.+):(\d+):(\d+)\s*$/)

    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`
    }
  }

  return null
}

/**
 * Format a classified error for console output.
 *
 * @param classified - The classified error
 * @param root - Project root path for making source locations relative
 * @param handleErrors - Whether to show detailed formatted output or a simple one-liner
 * @param suppressedWarnings - Framework warnings that were suppressed
 */
export function formatConsoleError(
  classified: ClassifiedSSRError,
  root?: string,
  handleErrors: boolean = true,
  suppressedWarnings: string[] = [],
): string {
  // Simple one-liner when handleErrors is disabled
  if (!handleErrors) {
    const component = classified.component ? `[${classified.component}]` : ''
    return `SSR Error ${component}: ${classified.error}`
  }

  const componentPart = classified.component ? `  ${colors.cyan}${classified.component}${colors.reset}` : ''

  const lines = [
    '',
    '',
    `  ${colors.bgRed}${colors.white}${colors.bold} SSR ERROR ${colors.reset}${componentPart}`,
    '',
    `  ${classified.error}`,
  ]

  if (classified.sourceLocation) {
    // Make path relative to project root for cleaner output
    let location = classified.sourceLocation

    if (root && location.startsWith(root)) {
      location = location.slice(root.length).replace(/^\//, '')
    }

    lines.push(`  ${colors.dim}Source: ${location}${colors.reset}`)
  }

  if (classified.url) {
    lines.push(`  ${colors.dim}URL: ${classified.url}${colors.reset}`)
  }

  lines.push('', `  ${colors.yellow}Hint${colors.reset}  ${classified.hint}`, '')

  if (classified.stack) {
    lines.push(`  ${colors.dim}${classified.stack.split('\n').join('\n  ')}${colors.reset}`, '')
  }

  if (suppressedWarnings.length > 0) {
    lines.push(
      `  ${colors.dim}Suppressed ${suppressedWarnings.length} framework warning(s).${colors.reset}`,
      '',
    )
  }

  return lines.join('\n')
}
