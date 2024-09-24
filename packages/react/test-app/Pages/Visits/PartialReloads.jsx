import { router, usePage } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ foo = 0, bar, baz, headers }) => {
  const page = usePage()

  useEffect(() => {
    window._inertia_props = page.props
  }, [])

  const partialReloadVisit = () => {
    router.visit('/visits/partial-reloads', { data: { foo: foo } })
  }

  const partialReloadVisitFooBar = () => {
    router.visit('/visits/partial-reloads', { data: { foo: foo }, only: ['headers', 'foo', 'bar'] })
  }

  const partialReloadVisitBaz = () => {
    router.visit('/visits/partial-reloads', { data: { foo: foo }, only: ['headers', 'baz'] })
  }

  const partialReloadVisitExceptFooBar = () => {
    router.visit('/visits/partial-reloads', { data: { foo: foo }, except: ['foo', 'bar'] })
  }

  const partialReloadVisitExceptBaz = () => {
    router.visit('/visits/partial-reloads', { data: { foo: foo }, except: ['baz'] })
  }

  const partialReloadGet = () => {
    router.get('/visits/partial-reloads', { foo: foo })
  }

  const partialReloadGetFooBar = () => {
    router.get('/visits/partial-reloads', { foo: foo }, { only: ['headers', 'foo', 'bar'] })
  }

  const partialReloadGetBaz = () => {
    router.get('/visits/partial-reloads', { foo: foo }, { only: ['headers', 'baz'] })
  }

  const partialReloadGetExceptFooBar = () => {
    router.get('/visits/partial-reloads', { foo: foo }, { except: ['foo', 'bar'] })
  }

  const partialReloadGetExceptBaz = () => {
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

      <span onClick={partialReloadVisit} className="visit">
        Update All (visit)
      </span>
      <span onClick={partialReloadVisitFooBar} className="visit-foo-bar">
        'Only' foo + bar (visit)
      </span>
      <span onClick={partialReloadVisitBaz} className="visit-baz">
        'Only' baz (visit)
      </span>
      <span onClick={partialReloadVisitExceptFooBar} className="visit-except-foo-bar">
        'Except' foo + bar (visit)
      </span>
      <span onClick={partialReloadVisitExceptBaz} className="visit-except-baz">
        'Except' baz (visit)
      </span>

      <span onClick={partialReloadGet} className="get">
        Update All (GET)
      </span>
      <span onClick={partialReloadGetFooBar} className="get-foo-bar">
        'Only' foo + bar (GET)
      </span>
      <span onClick={partialReloadGetBaz} className="get-baz">
        'Only' baz (GET)
      </span>
      <span onClick={partialReloadGetExceptFooBar} className="get-except-foo-bar">
        'Except' foo + bar (GET)
      </span>
      <span onClick={partialReloadGetExceptBaz} className="get-except-baz">
        'Except' baz (GET)
      </span>
    </div>
  )
}
