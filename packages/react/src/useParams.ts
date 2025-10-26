import { useContext, useMemo } from 'react'
import PageContext from './PageContext'

export default function useParams<T extends Record<string, string> = Record<string, string>>() {
  const page = useContext(PageContext)

  if (!page) {
    throw new Error('useParams must be used within the Inertia component')
  }

  return useMemo(() => page.props.routeParams as T, [page.props.routeParams])
}
