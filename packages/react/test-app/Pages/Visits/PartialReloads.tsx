import { router, usePage } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ foo = 0, bar, baz, headers }) => {
  const page = usePage()

  useEffect(() => {
    window._inertia_props = page.props
  }, [])

  const partialReloadVisit = (e) => {
    e.preventDefault()
    router.visit('/visits/partial-reloads', { data: { foo: foo } })
  }

  const partialReloadVisitFooBar = (e) => {
    e.preventDefault()
    router.visit('/visits/partial-reloads', { data: { foo: foo }, only: ['headers', 'foo', 'bar'] })
  }

  const partialReloadVisitBaz = (e) => {
    e.preventDefault()
    router.visit('/visits/partial-reloads', { data: { foo: foo }, only: ['headers', 'baz'] })
  }

  const partialReloadVisitExceptFooBar = (e) => {
    e.preventDefault()
    router.visit('/visits/partial-reloads', { data: { foo: foo }, except: ['foo', 'bar'] })
  }

  const partialReloadVisitExceptBaz = (e) => {
    e.preventDefault()
    router.visit('/visits/partial-reloads', { data: { foo: foo }, except: ['baz'] })
  }

  const partialReloadGet = (e) => {
    e.preventDefault()
    router.get('/visits/partial-reloads', { foo: foo })
  }

  const partialReloadGetFooBar = (e) => {
    e.preventDefault()
    router.get('/visits/partial-reloads', { foo: foo }, { only: ['headers', 'foo', 'bar'] })
  }

  const partialReloadGetBaz = (e) => {
    e.preventDefault()
    router.get('/visits/partial-reloads', { foo: foo }, { only: ['headers', 'baz'] })
  }

  const partialReloadGetExceptFooBar = (e) => {
    e.preventDefault()
    router.get('/visits/partial-reloads', { foo: foo }, { except: ['foo', 'bar'] })
  }

  const partialReloadGetExceptBaz = (e) => {
    e.preventDefault()
    router.get(
      '/visits/partial-reloads',
      { foo: foo },
      {
        except: ['baz'],
      },
    )
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates partial reloads using manual visits</span>
      <span className="foo-text">Foo is now {foo}</span>
      <span className="bar-text">Bar is now {bar}</span>
      <span className="baz-text">Baz is now {baz}</span>
      <pre className="headers">{JSON.stringify(headers, null, 2)}</pre>

      <a href="#" onClick={partialReloadVisit} className="visit">
        Update All (visit)
      </a>
      <a href="#" onClick={partialReloadVisitFooBar} className="visit-foo-bar">
        'Only' foo + bar (visit)
      </a>
      <a href="#" onClick={partialReloadVisitBaz} className="visit-baz">
        'Only' baz (visit)
      </a>
      <a href="#" onClick={partialReloadVisitExceptFooBar} className="visit-except-foo-bar">
        'Except' foo + bar (visit)
      </a>
      <a href="#" onClick={partialReloadVisitExceptBaz} className="visit-except-baz">
        'Except' baz (visit)
      </a>

      <a href="#" onClick={partialReloadGet} className="get">
        Update All (GET)
      </a>
      <a href="#" onClick={partialReloadGetFooBar} className="get-foo-bar">
        'Only' foo + bar (GET)
      </a>
      <a href="#" onClick={partialReloadGetBaz} className="get-baz">
        'Only' baz (GET)
      </a>
      <a href="#" onClick={partialReloadGetExceptFooBar} className="get-except-foo-bar">
        'Except' foo + bar (GET)
      </a>
      <a href="#" onClick={partialReloadGetExceptBaz} className="get-except-baz">
        'Except' baz (GET)
      </a>
    </div>
  )
}
