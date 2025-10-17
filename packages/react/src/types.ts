import { PageHandler } from '@inertiajs/core'
import { ReactNode } from 'react'

export type ReactPageHandlerArgs = Omit<Parameters<PageHandler>[0], 'component'> & {
  component: ReactNode
}
