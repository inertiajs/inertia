import { Link, router } from '@inertiajs/react'

export default ({ foo }: { foo: string }) => {
  const visitWithComponent = () => {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
    })
  }

  const visitWithComponentAndPageProps = () => {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      pageProps: { greeting: 'Placeholder greeting' },
    })
  }

  const visitRedirecting = () => {
    router.visit('/instant-visit/redirecting?delay=500', {
      component: 'InstantVisit/Target',
    })
  }

  const visitDeferred = () => {
    router.visit('/instant-visit/deferred?delay=500', {
      component: 'InstantVisit/Deferred',
      pageProps: { title: 'Placeholder Title' },
    })
  }

  return (
    <div>
      <div id="page1">This is Page1</div>
      <div>Foo: {foo}</div>

      <button onClick={visitWithComponent}>Visit with component</button>
      <button onClick={visitWithComponentAndPageProps}>Visit with component and pageProps</button>
      <button onClick={visitRedirecting}>Visit redirecting</button>
      <button onClick={visitDeferred}>Visit deferred</button>

      <Link href="/instant-visit/target?delay=500" component="InstantVisit/Target">
        Link with component
      </Link>
      <Link
        href={{ url: '/instant-visit/target?delay=500', method: 'get', component: 'InstantVisit/Target' }}
        clientSide
      >
        Link with clientSide
      </Link>
    </div>
  )
}
