/**
 * SSR Transform
 *
 * This module transforms the SSR entry file to wrap the Inertia app configuration
 * with server bootstrap code. Instead of manually writing the server setup:
 *
 * ```js
 * import { configureInertiaApp } from '@inertiajs/vue3'
 * import createServer from '@inertiajs/vue3/server'
 * import { renderToString } from 'vue/server-renderer'
 *
 * const render = await configureInertiaApp({ ... })
 *
 * createServer((page) => render(page, renderToString))
 * ```
 *
 * Users can simply write:
 *
 * ```js
 * import { configureInertiaApp } from '@inertiajs/vue3'
 *
 * configureInertiaApp({ ... })
 * ```
 *
 * The plugin automatically detects the framework and injects the appropriate
 * server bootstrap code during SSR builds.
 */

import { ParsedCode } from './astUtils'
import { type FrameworkConfig, type SSROptions, formatSSROptions } from './types'

/**
 * Check if the code contains a top-level Inertia app configuration call.
 *
 * This is used as a quick check before applying the full transform.
 * Returns true for code like:
 *
 * ```js
 * configureInertiaApp({ ... })
 * ```
 *
 * But NOT for:
 *
 * ```js
 * export default configureInertiaApp({ ... })
 * ```
 *
 * The SSR entry should have a bare call, not an export, because we need
 * to wrap it with server bootstrap code.
 */
export function findInertiaAppExport(code: string): boolean {
  return !!ParsedCode.from(code)?.inertiaStatement
}

/**
 * Wrap the Inertia app configuration with server bootstrap code.
 *
 * This transform:
 * 1. Finds the `configureInertiaApp()` or `createInertiaApp()` call
 * 2. Detects which framework is being used (Vue, React, Svelte)
 * 3. Wraps the call with the framework's SSR template
 *
 * The SSR template is defined in each framework's config file (e.g., `frameworks/vue.ts`).
 *
 * The generated code uses `import.meta.hot` to detect dev vs production at runtime:
 * - In dev: `import.meta.hot` exists, so createServer is skipped (Vite handles HTTP)
 * - In production: `import.meta.hot` is undefined, so createServer runs
 *
 * @returns The transformed code, or null if no transformation was needed
 */
export function wrapWithServerBootstrap(
  code: string,
  options: SSROptions,
  frameworks: Record<string, FrameworkConfig>,
): string | null {
  const parsed = ParsedCode.from(code)

  // Must have a top-level Inertia call to transform
  if (!parsed?.inertiaStatement) {
    return null
  }

  // Detect framework and ensure it has SSR support
  const framework = parsed.detectFramework(frameworks)

  if (!framework?.config.ssr) {
    return null
  }

  // Extract the original configureInertiaApp(...) call as a string
  const { statement, call } = parsed.inertiaStatement
  const configureCall = code.slice(call.start, call.end)

  // Apply the framework's SSR template to wrap the call
  const ssrCode = framework.config.ssr(configureCall, formatSSROptions(options)).trim()

  // Replace the original statement with the wrapped version
  // This preserves any code before/after the Inertia call
  return code.slice(0, statement.start) + ssrCode + code.slice(statement.end)
}
