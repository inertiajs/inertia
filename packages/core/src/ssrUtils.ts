import { getInitialPageFromDOM } from './domUtils'
import { router } from './index'
import type { Page, PageProps } from './types'

export function buildSSRBody(id: string, page: Page, html: string, useScriptElement: boolean): string {
  if (useScriptElement) {
    const json = JSON.stringify(page).replace(/\//g, '\\/')

    return `<script data-page="${id}" type="application/json">${json}</script><div data-server-rendered="true" id="${id}">${html}</div>`
  }

  const escaped = JSON.stringify(page).replace(/"/g, '&quot;')

  return `<div data-server-rendered="true" id="${id}" data-page="${escaped}">${html}</div>`
}

export function createComponentResolver<T>(
  resolve: (name: string) => T | Promise<T> | { default: T },
): (name: string) => Promise<T> {
  return (name) => Promise.resolve(resolve(name)).then((module) => (module as { default?: T }).default ?? (module as T))
}

export async function loadInitialPage<T extends PageProps, C>(
  id: string,
  useScriptElement: boolean,
  resolveComponent: (name: string) => Promise<C>,
): Promise<{ page: Page<T>; component: C }> {
  const page = getInitialPageFromDOM<Page<T>>(id, useScriptElement)!

  const [component] = await Promise.all([resolveComponent(page.component), router.decryptHistory().catch(() => {})])

  return { page, component }
}
