import { isMainModule } from '@angular/ssr/node'
import { createServer, renderAngularApp } from '@inertiajs/angular/server'
import { fallbackPage, pages } from './pages'

const render = (page: Parameters<typeof renderAngularApp>[0]) =>
  renderAngularApp(page, {
    resolve: (name) => pages[name] ?? fallbackPage,
    serverHead: true,
    title: (title, currentPage) =>
      new URL(currentPage.url, 'http://localhost').searchParams.has('withTitleCallback')
        ? [title, currentPage.props['titleSuffix']].filter(Boolean).join(' | ')
        : title,
  })

if (isMainModule(import.meta.url)) {
  createServer(render)
}

export default render
