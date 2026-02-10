/**
 * SSR Transform
 *
 * This module transforms the SSR entry file to wrap the Inertia app configuration
 * with server bootstrap code. Instead of manually writing the server setup:
 *
 * ```js
 * import { createInertiaApp } from '@inertiajs/vue3'
 * import createServer from '@inertiajs/vue3/server'
 * import { renderToString } from 'vue/server-renderer'
 *
 * const render = await createInertiaApp({ ... })
 *
 * createServer((page) => render(page, renderToString))
 * ```
 *
 * Users can simply write:
 *
 * ```js
 * import { createInertiaApp } from '@inertiajs/vue3'
 *
 * createInertiaApp({ ... })
 * ```
 *
 * The plugin automatically detects the framework and injects the appropriate
 * server bootstrap code during SSR builds.
 */

import { ParsedCode } from './astUtils'
import { type FrameworkConfig, type SSROptions, formatSSROptions } from './types'

/**
 * Check if the code contains a top-level Inertia app configuration call
 * or a createServer call that needs transformation.
 *
 * This is used as a quick check before applying the full transform.
 * Returns true for code like:
 *
 * ```js
 * createInertiaApp({ ... })
 * ```
 *
 * Or for legacy createServer patterns:
 *
 * ```js
 * createServer((page) => createInertiaApp({ ... }))
 * ```
 *
 * But NOT for code that already has an export:
 *
 * ```js
 * export default createInertiaApp({ ... })
 * ```
 *
 * The SSR entry should have a bare call, not an export, because we need
 * to wrap it with server bootstrap code.
 */
export function findInertiaAppExport(code: string): boolean {
  const parsed = ParsedCode.from(code)
  return !!(parsed?.inertiaStatement || parsed?.createServerStatement)
}

/**
 * Wrap the Inertia app configuration with server bootstrap code.
 *
 * This transform:
 * 1. Finds the `createInertiaApp()` or `createInertiaApp()` call
 * 2. Detects which framework is being used (Vue, React, Svelte)
 * 3. Wraps the call with the framework's SSR template
 *
 * The SSR template is defined in each framework's config file (e.g., `frameworks/vue.ts`).
 *
 * The generated code uses `import.meta.env.PROD` to detect dev vs production:
 * - In dev: `import.meta.env.PROD` is false, so createServer is skipped (Vite handles SSR)
 * - In production: `import.meta.env.PROD` is true, so createServer runs
 *
 * For backwards compatibility, it also handles the legacy createServer pattern:
 * ```js
 * createServer((page) => createInertiaApp({ ... }))
 * ```
 *
 * @returns The transformed code, or null if no transformation was needed
 */
export function wrapWithServerBootstrap(
  code: string,
  options: SSROptions,
  frameworks: Record<string, FrameworkConfig>,
): string | null {
  const parsed = ParsedCode.from(code)

  if (!parsed) {
    return null
  }

  // Handle the new pattern: bare createInertiaApp() call
  if (parsed.inertiaStatement) {
    // Detect framework and ensure it has SSR support
    const framework = parsed.detectFramework(frameworks)

    if (!framework?.config.ssr) {
      return null
    }

    // Extract the original createInertiaApp(...) call as a string
    const { statement, call } = parsed.inertiaStatement
    const configureCall = code.slice(call.start, call.end)

    // Apply the framework's SSR template to wrap the call
    const ssrCode = framework.config.ssr(configureCall, formatSSROptions(options)).trim()

    // Replace the original statement with the wrapped version
    // This preserves any code before/after the Inertia call
    return code.slice(0, statement.start) + ssrCode + code.slice(statement.end)
  }

  // Handle the legacy pattern: createServer((page) => createInertiaApp({ ... }))
  if (parsed.createServerStatement) {
    const statement = parsed.createServerStatement
    const args = (statement.expression as unknown as { arguments: Array<{ start: number; end: number }> }).arguments
    const callback = code.slice(args[0].start, args[0].end)
    const trailingArgs = code.slice(args[0].end, args[args.length - 1].end)

    const replacement = `const renderPage = ${callback}

if (import.meta.env.PROD) {
  createServer(renderPage${trailingArgs})
}

export default renderPage`

    return code.slice(0, statement.start) + replacement + code.slice(statement.end)
  }

  return null
}
