import { Page, PageProps } from '@inertiajs/core'
import { useContext } from 'react'
import PageContext from './PageContext'

export default function UsePage<TPageProps extends PageProps = PageProps>(): Page<TPageProps> {
  const page = useContext(PageContext)

  if (!page) {
    throw new Error('UsePage must be used within the Inertia component')
  }

  return page
}
