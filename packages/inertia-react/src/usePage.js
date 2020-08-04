import { useContext } from 'react'
import PageContext from './PageContext'

export default function usePage() {
  const page = useContext(PageContext)

  if (!page) {
    throw new Error('usePage must be used within the Inertia component')
  }

  return page
}
