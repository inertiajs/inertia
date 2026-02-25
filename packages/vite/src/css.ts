/**
 * SSR CSS Collection
 *
 * Collects CSS dependencies from Vite's module graph to prevent FOUC
 * (Flash of Unstyled Content) during SSR development.
 *
 * In dev mode, Vite normally injects CSS via JavaScript on the client side.
 * When SSR is enabled, the server-rendered HTML arrives before any JS executes,
 * causing unstyled content to flash briefly. This module traverses the SSR
 * environment's module graph starting from the entry to find all CSS
 * dependencies, then generates <link> tags so the browser fetches styles
 * immediately with the initial HTML.
 *
 * The generated <link> tags include `data-vite-dev-id` attributes so Vite's
 * client JS can deduplicate them and avoid injecting duplicate <style> tags.
 */

import { resolve } from 'node:path'
import type { EnvironmentModuleNode, ViteDevServer } from 'vite'

export function collectCSSFromModuleGraph(server: ViteDevServer, entry: string): string[] {
  const entryModule = resolveEntryModule(server, entry)

  if (!entryModule) {
    return []
  }

  const cssModules = collectCSSModules(entryModule)

  if (cssModules.length === 0) {
    return []
  }

  const origin = resolveDevServerOrigin(server)
  const base = server.config.base || '/'
  const basePrefix = base === '/' ? '' : base

  return cssModules.map(({ url, id }) => {
    const href = `${origin}${basePrefix}${url}`
    const devId = id ? ` data-vite-dev-id="${id}"` : ''

    return `<link rel="stylesheet" href="${href}"${devId}>`
  })
}

function resolveEntryModule(server: ViteDevServer, entry: string): EnvironmentModuleNode | undefined {
  const resolvedEntry = resolve(server.config.root, entry)

  return server.environments.ssr.moduleGraph.getModuleById(resolvedEntry)
}

function collectCSSModules(entryModule: EnvironmentModuleNode): { url: string; id: string | null }[] {
  const cssModules: { url: string; id: string | null }[] = []
  const visited = new Set<EnvironmentModuleNode>()

  function traverse(mod: EnvironmentModuleNode): void {
    if (visited.has(mod)) {
      return
    }

    visited.add(mod)

    if (isCSSRequest(mod.url)) {
      cssModules.push({ url: mod.url, id: mod.id })
    }

    for (const imported of mod.importedModules) {
      traverse(imported)
    }
  }

  traverse(entryModule)

  return cssModules
}

const CSS_EXTENSIONS = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/

function isCSSRequest(url: string): boolean {
  return CSS_EXTENSIONS.test(url)
}

function resolveDevServerOrigin(server: ViteDevServer): string {
  if (server.resolvedUrls?.local[0]) {
    return server.resolvedUrls.local[0].replace(/\/$/, '')
  }

  const protocol = server.config.server.https ? 'https' : 'http'
  const port = server.config.server.port ?? 5173

  return `${protocol}://localhost:${port}`
}
