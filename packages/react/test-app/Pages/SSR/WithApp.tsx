import { createContext, useContext } from 'react'

type WithAppValue = {
  injected: string
  locale: string
  component: string
}

export const WithAppContext = createContext<WithAppValue>({
  injected: 'not-injected',
  locale: 'not-injected',
  component: 'not-injected',
})

export default () => {
  const withAppValue = useContext(WithAppContext)

  return (
    <div>
      <h1 data-testid="with-app-title">SSR WithApp</h1>
      <p data-testid="with-app-value">Value: {withAppValue.injected}</p>
      <p data-testid="with-app-locale">Locale: {withAppValue.locale}</p>
      <p data-testid="with-app-component">Component: {withAppValue.component}</p>
    </div>
  )
}
