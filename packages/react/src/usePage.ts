import { Page, PageProps, SharedPageProps } from '@inertiajs/core'
import React from 'react'
import PageContext from './PageContext'
import { isReact19 } from './react'

export default function usePage<TPageProps extends PageProps = PageProps>(): Page<TPageProps & SharedPageProps> {
  // React.use() was introduced in React 19, fallback to React.useContext() for earlier versions
  const page = isReact19 ? React.use(PageContext) : React.useContext(PageContext)

  if (!page) {
    throw new Error('usePage must be used within the Inertia component')
  }

  return page as Page<TPageProps & SharedPageProps>
}
