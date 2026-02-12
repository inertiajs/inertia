import type { Page } from './types'

export function buildSSRBody(id: string, page: Page, html: string): string {
  const json = JSON.stringify(page).replace(/\//g, '\\/')

  return `<script data-page="${id}" type="application/json">${json}</script><div data-server-rendered="true" id="${id}">${html}</div>`
}
