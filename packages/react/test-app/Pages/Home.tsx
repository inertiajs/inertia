import { Head, Link, router } from '@inertiajs/react'

export default (props: { example: string }) => {
  const visitsMethod = (e: React.MouseEvent) => {
    e.preventDefault()
    router.visit('/visits/method')
  }

  const visitsReplace = (e: React.MouseEvent) => {
    e.preventDefault()
    router.get('/visits/replace')
  }

  const redirect = (e: React.MouseEvent) => {
    e.preventDefault()
    router.post('/redirect')
  }

  const redirectExternal = (e: React.MouseEvent) => {
    e.preventDefault()
    router.post('/redirect-external')
  }

  // window._inertia_page_key = getCurrentInstance().uid
  window._inertia_props = props
  // window._plugin_global_props = getCurrentInstance().appContext.config.globalProperties

  return (
    <>
      <Head title="Home" />

      <div>
        <span className="text">This is the Test App Entrypoint page</span>

        <Link href="/links/method" className="links-method">
          Basic Links
        </Link>

        <Link href="/links/replace" className="links-replace">
          'Replace' Links
        </Link>

        <Link href="/links/as-component" className="links-as-component">
          As Component
        </Link>

        <Link href="/links/as-element" className="links-as-component">
          As Element
        </Link>

        <a href="#" onClick={visitsMethod} className="visits-method">
          Manual basic visits
        </a>

        <a href="#" onClick={visitsReplace} className="visits-replace">
          Manual 'Replace' visits
        </a>

        <Link href="/redirect" method="post" className="links-redirect">
          Internal Redirect Link
        </Link>
        <a href="#" onClick={redirect} className="visits-redirect">
          Manual Redirect visit
        </a>

        <Link href="/redirect-external" method="post" className="links-redirect-external">
          External Redirect Link
        </Link>

        <a href="#" onClick={redirectExternal} className="visits-redirect-external">
          Manual External Redirect visit
        </a>

        <Link id="navigate-back" href="/head/mixed">
          Go to Mixed Head
        </Link>
      </div>
    </>
  )
}
