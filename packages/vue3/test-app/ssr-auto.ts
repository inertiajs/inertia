import { configureInertiaApp } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'

// This file uses configureInertiaApp as a standalone expression (not exported)
// The Vite plugin SSR transform will automatically:
// 1. Wrap this with server bootstrap code
// 2. Import and use the Vue server renderer
// 3. Export a default render function

configureInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<DefineComponent>('./Pages/SSR/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
})
