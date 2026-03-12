import { createContext, useContext } from 'react'

export const WithAppContext = createContext('not-injected')

export default () => {
  const withAppValue = useContext(WithAppContext)

  return (
    <div>
      <h1 data-testid="with-app-title">SSR WithApp</h1>
      <p data-testid="with-app-value">Value: {withAppValue}</p>
    </div>
  )
}
