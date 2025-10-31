import { Page } from '@inertiajs/core'
import { createContext } from 'react'

const pageContext = createContext<Page | null>(null)
pageContext.displayName = 'InertiaPageContext'

export default pageContext
