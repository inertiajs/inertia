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
  resolve: (name: string, page?: Page) => T | Promise<T> | { default: T },
): (name: string, page?: Page) => Promise<T> {
  return (name, page) =>
    Promise.resolve(resolve(name, page)).then((module) => (module as { default?: T }).default ?? (module as T))
}

export async function loadInitialPage<T extends PageProps, C>(
  id: string,
  useScriptElement: boolean,
  resolveComponent: (name: string, page?: Page) => Promise<C>,
): Promise<{ page: Page<T>; component: C }> {
  const page = getInitialPageFromDOM<Page<T>>(id, useScriptElement)!

  const [component] = await Promise.all([
    resolveComponent(page.component, page),
    router.decryptHistory().catch(() => {}),
  ])

  return { page, component }
}
