import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

createInertiaApp({
  page: window.initialPage,
  resolve: (name) => {
    if (name === 'FormHelper/Data') {
      return pages[`./Pages/${name}.tsx`]
    }
    
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
