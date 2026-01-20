import { Link } from '@inertiajs/react'

export default () => {
  const resolverPage = window.resolverReceivedPage
  const componentName = resolverPage?.component ?? 'N/A'
  const pageUrl = resolverPage?.url ?? 'N/A'

  return (
    <div>
      <h1>Resolver Page Test</h1>
      <div id="resolver-component">Component: {componentName}</div>
      <div id="resolver-url">URL: {pageUrl}</div>
      <Link id="go-to-second" href="/resolver-page/second">
        Go to Second Page
      </Link>
    </div>
  )
}
