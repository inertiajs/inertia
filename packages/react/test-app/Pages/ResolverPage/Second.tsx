import { Link } from '@inertiajs/react'

export default () => {
  const resolverPage = window.resolverReceivedPage
  const componentName = resolverPage?.component ?? 'N/A'
  const pageUrl = resolverPage?.url ?? 'N/A'

  return (
    <div>
      <h1>Second Resolver Page</h1>
      <div id="resolver-component">Component: {componentName}</div>
      <div id="resolver-url">URL: {pageUrl}</div>
      <Link id="go-to-first" href="/resolver-page">
        Go to First Page
      </Link>
    </div>
  )
}
