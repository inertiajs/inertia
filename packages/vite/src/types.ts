/**
 * Shared Type Definitions
 *
 * This module contains types used across the Vite plugin for framework
 * configuration and SSR options.
 */

/**
 * A function that generates SSR bootstrap code for a framework.
 *
 * The function receives the original `configureInertiaApp(...)` call as a string
 * and should return code that wraps it with server bootstrap logic.
 *
 * @param configureCall - The original configureInertiaApp(...) call, e.g., `configureInertiaApp({ resolve: ... })`
 * @param options - Formatted SSR options string, e.g., `, {"port":13715}` or empty string
 *
 * @example
 * ```ts
 * const template: SSRTemplate = (configureCall, options) => `
 *   import createServer from '@inertiajs/vue3/server'
 *   import { renderToString } from 'vue/server-renderer'
 *
 *   const render = await ${configureCall}
 *
 *   createServer((page) => render(page, renderToString)${options})
 * `
 * ```
 */
export type SSRTemplate = (configureCall: string, options: string) => string

/**
 * Configuration for a framework adapter.
 *
 * This defines how the Vite plugin should handle page resolution and SSR
 * for a specific framework (Vue, React, Svelte, or custom).
 *
 * @example
 * ```ts
 * const solidConfig: FrameworkConfig = {
 *   package: '@inertiajs/solid',
 *   extensions: ['.tsx', '.jsx'],
 *   extractDefault: true,
 *   ssr: (configureCall, options) => `...`
 * }
 * ```
 */
export interface FrameworkConfig {
  /**
   * The npm package name that identifies this framework.
   * The plugin detects the framework by looking for imports from this package.
   *
   * Examples: '@inertiajs/vue3', '@inertiajs/react', '@inertiajs/svelte'
   */
  package: string

  /**
   * File extensions for page components.
   * Used when building the import.meta.glob pattern.
   *
   * Examples:
   * - Vue: ['.vue']
   * - React: ['.tsx', '.jsx']
   * - Svelte: ['.svelte']
   */
  extensions: string[]

  /**
   * Whether to extract the default export from page modules.
   *
   * - `true` (default): Return `module.default ?? module` - used by Vue and React
   *   where components are typically exported as `export default`
   * - `false`: Return `module` directly - used by Svelte where the component
   *   is the module itself
   */
  extractDefault?: boolean

  /**
   * SSR template function for generating server bootstrap code.
   * If not provided, SSR transform will be skipped for this framework.
   */
  ssr?: SSRTemplate
}

/**
 * Options passed to the SSR server bootstrap code.
 */
export interface SSROptions {
  /**
   * Port number for the SSR server.
   * Used in production when running the SSR server as a separate process.
   */
  port?: number

  /**
   * Whether to enable cluster mode for the SSR server.
   * Cluster mode spawns multiple worker processes for better performance.
   */
  cluster?: boolean
}

/**
 * Format SSR options as a string to be inserted into generated code.
 *
 * Returns an empty string if no options are set, otherwise returns
 * a comma-prefixed JSON string like `, {"port":13715,"cluster":true}`.
 */
export function formatSSROptions(options: SSROptions): string {
  const entries = Object.entries(options).filter(([, v]) => v !== undefined)

  return entries.length > 0 ? `, ${JSON.stringify(Object.fromEntries(entries))}` : ''
}
