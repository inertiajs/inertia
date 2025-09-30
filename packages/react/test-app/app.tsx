import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

createInertiaApp({
  page: window.initialPage,
  resolve: async (name) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      // Add small delay to ensure the component is loaded after the initial page load
      // This is for projects that don't use { eager: true } in import.meta.glob
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    delay: 0,
    color: 'red',
  },
})
