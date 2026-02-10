import type { Page } from './types'

export function buildSSRBody(id: string, page: Page, html: string, useScriptElement: boolean): string {
  if (useScriptElement) {
    const json = JSON.stringify(page).replace(/\//g, '\\/')

    return `<script data-page="${id}" type="application/json">${json}</script><div data-server-rendered="true" id="${id}">${html}</div>`
  }

  const escaped = JSON.stringify(page).replace(/"/g, '&quot;')

  return `<div data-server-rendered="true" id="${id}" data-page="${escaped}">${html}</div>`
}
