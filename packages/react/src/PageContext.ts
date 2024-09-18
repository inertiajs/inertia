import { createContext } from 'react'

const pageContext = createContext(undefined)
pageContext.displayName = 'InertiaPageContext'

export default pageContext
