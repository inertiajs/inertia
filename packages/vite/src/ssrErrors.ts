/**
 * SSR Error Classification
 *
 * This module detects common SSR errors and provides helpful hints
 * to developers on how to fix them. The most common issue is using
 * browser-specific APIs (like window, document) that don't exist
 * in the Node.js server environment.
 */

import { BROWSER_APIS, type ClassifiedSSRError, type SSRErrorType } from '@inertiajs/core/server'

export { BROWSER_APIS, type ClassifiedSSRError, type SSRErrorType }

/** Used in hint messages to suggest the right lifecycle hook per framework. */
const LIFECYCLE_HOOKS: Record<string, string> = {
  vue: 'onMounted',
  react: 'useEffect',
  svelte: 'onMount',
}

/**
 * Detect which browser API is referenced in the error message.
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

export function isComponentResolutionError(error: Error): boolean {
  const message = error.message.toLowerCase()

  return (
    message.includes('cannot find module') ||
    message.includes('failed to resolve') ||
    message.includes('module not found') ||
    message.includes('could not resolve')
  )
}

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

export function getComponentResolutionHint(component?: string): string {
  const componentPart = component ? ` "${component}"` : ''

  return (
    `Could not resolve component${componentPart}. ` +
    `Check that the file exists and the path is correct. ` +
    `Ensure the component name matches the file name exactly (case-sensitive).`
  )
}

export function getRenderErrorHint(): string {
  return (
    'An error occurred while rendering the component. ' +
    'Check the component for browser-specific code that runs during initialization. ' +
    'Move any code that accesses browser APIs to a lifecycle hook.'
  )
}

/**
 * Classify the error and attach a hint for the console output.
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
 * Pull the first user-authored source location from a stack trace,
 * skipping node_modules and Node.js internals.
 */
function extractSourceLocation(stack?: string): string | null {
  if (!stack) {
    return null
  }

  const lines = stack.split('\n')

  for (const line of lines) {
    if (!line.includes('at ')) {
      continue
    }

    if (line.includes('node_modules') || line.includes('node:')) {
      continue
    }

    let match = line.match(/\(([^)]+):(\d+):(\d+)\)/)

    if (match) {
      const path = match[1].replace(/^file:\/\//, '')

      return `${path}:${match[2]}:${match[3]}`
    }

    match = line.match(/at\s+(?:file:\/\/)?(.+):(\d+):(\d+)\s*$/)

    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`
    }
  }

  return null
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
    '',
    `  ${colors.bgRed}${colors.white}${colors.bold} SSR ERROR ${colors.reset}${componentPart}`,
    '',
    `  ${classified.error}`,
  ]

  if (classified.sourceLocation) {
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
    lines.push(`  ${colors.dim}Suppressed ${suppressedWarnings.length} framework warning(s).${colors.reset}`, '')
  }

  return lines.join('\n')
}
