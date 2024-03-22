import { createContext } from 'react'

const frameContext = createContext(undefined)
frameContext.displayName = 'InertiaFrameContext'

export default frameContext
