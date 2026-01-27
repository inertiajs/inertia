import { getInitialPageFromDOM } from './domUtils'
import { router } from './index'
import type { InertiaAppSSRResponse, Page, PageProps } from './types'

type InertiaEnv = {
  INERTIA_SSR_DEV?: boolean
  INERTIA_SSR_CONFIG?: { port?: number; cluster?: boolean }
}

function inertiaEnv(): InertiaEnv | undefined {
  return (import.meta as ImportMeta & { env?: InertiaEnv }).env
}

export function buildSSRBody(id: string, page: Page, html: string, useScriptElement: boolean): string {
  if (useScriptElement) {
    const json = JSON.stringify(page).replace(/\//g, '\\/')

    return `<script data-page="${id}" type="application/json">${json}</script><div data-server-rendered="true" id="${id}">${html}</div>`
  }

  const escaped = JSON.stringify(page).replace(/"/g, '&quot;')

  return `<div data-server-rendered="true" id="${id}" data-page="${escaped}">${html}</div>`
}

export function isSSRDevMode(): boolean {
  return inertiaEnv()?.INERTIA_SSR_DEV === true
}

export async function bootstrapSSRServer(render: (page: Page) => Promise<InertiaAppSSRResponse>): Promise<void> {
  const config = inertiaEnv()?.INERTIA_SSR_CONFIG
  const serverModule = '@inertiajs/core/server'
  const { default: createServer } = await import(/* @vite-ignore */ serverModule)

  createServer(render, { port: config?.port, cluster: config?.cluster })
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
