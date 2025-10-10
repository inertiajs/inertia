import { HeadManager } from '@inertiajs/core'
import { createContext } from 'react'

const headContext = createContext<HeadManager | null>(null)
headContext.displayName = 'InertiaHeadContext'

export default headContext
