import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { createElement } from 'react'
import { WithAppContext } from './Pages/SSR/WithApp'

// This file uses createInertiaApp as a standalone expression (not exported)
// The Vite plugin SSR transform will automatically:
// 1. Wrap this with server bootstrap code
// 2. Import and use the React server renderer
// 3. Export a default render function

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  withApp(app) {
    return createElement(WithAppContext.Provider, { value: 'injected-via-withApp' }, app)
  },
})
