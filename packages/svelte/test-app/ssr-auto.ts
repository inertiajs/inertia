import { configureInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'

// This file uses configureInertiaApp as a standalone expression (not exported)
// The Vite plugin SSR transform will automatically:
// 1. Wrap this with server bootstrap code
// 2. Import and use the Svelte server renderer
// 3. Export a default render function

configureInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
})
