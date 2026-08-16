import { createInertiaApp } from '@inertiajs/angular'
import { PlaygroundLayout, pages } from './pages'

void createInertiaApp({
  resolve: (name) => pages[name] ?? pages['Home']!,
  title: (title) => `${title} - Angular Playground`,
  layout: () => PlaygroundLayout,
})
