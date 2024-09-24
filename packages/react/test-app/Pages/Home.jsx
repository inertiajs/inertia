import { Link, router } from '@inertiajs/react'

export default (props) => {
  const visitsMethod = () => {
    router.visit('/visits/method')
  }

  const visitsReplace = () => {
    router.get('/visits/replace')
  }

  const redirect = () => {
    router.post('/redirect')
  }

  const redirectExternal = () => {
    router.post('/redirect-external')
  }

  // window._inertia_page_key = getCurrentInstance().uid
  window._inertia_props = props
  // window._plugin_global_props = getCurrentInstance().appContext.config.globalProperties

  return (
    <div>
      <span className="text">This is the Test App Entrypoint page</span>

      <Link href="/links/method" className="links-method">
        Basic Links
      </Link>

      <Link href="/links/replace" className="links-replace">
        'Replace' Links
      </Link>

      <span onClick={visitsMethod} className="visits-method">
        Manual basic visits
      </span>

      <span onClick={visitsReplace} className="visits-replace">
        Manual 'Replace' visits
      </span>

      <Link href="/redirect" method="post" className="links-redirect">
        Redirect Link
      </Link>
      <span onClick={redirect} className="visits-redirect">
        Manual Redirect visit
      </span>

      <Link href="/redirect-external" method="post" className="links-redirect-external">
        Redirect Link
      </Link>

      <span onClick={redirectExternal} className="visits-redirect-external">
        Manual External Redirect visit
      </span>
    </div>
  )
}
