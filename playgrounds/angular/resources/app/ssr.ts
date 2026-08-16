import { isMainModule } from '@angular/ssr/node'
import { createServer, renderAngularApp } from '@inertiajs/angular/server'
import { PlaygroundLayout, pages } from './pages'

const render = (page: Parameters<typeof renderAngularApp>[0]) =>
  renderAngularApp(page, {
    resolve: (name) => pages[name] ?? pages['Home']!,
    title: (title) => `${title} - Angular Playground`,
    layout: () => PlaygroundLayout,
    serverHead: true,
  })

if (isMainModule(import.meta.url)) createServer(render)

export default render
