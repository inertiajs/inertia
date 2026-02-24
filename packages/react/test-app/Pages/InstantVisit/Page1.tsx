import { Link, router } from '@inertiajs/react'

export default ({ foo, auth }: { foo: string; auth?: { user: string } }) => {
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

  const visitWithPagePropsCallback = () => {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      pageProps: (currentProps) => ({ greeting: `Was on page with foo: ${currentProps.foo}` }),
    })
  }

  const visitWithPagePropsCallbackUsingShared = () => {
    router.visit('/instant-visit/target?delay=500', {
      component: 'InstantVisit/Target',
      pageProps: (_currentProps, sharedProps) => ({
        ...sharedProps,
        greeting: 'Placeholder with shared',
      }),
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
      <div id="auth">Auth: {auth?.user ?? 'none'}</div>

      <button onClick={visitWithComponent}>Visit with component</button>
      <button onClick={visitWithComponentAndPageProps}>Visit with component and pageProps</button>
      <button onClick={visitWithPagePropsCallback}>Visit with pageProps callback</button>
      <button onClick={visitWithPagePropsCallbackUsingShared}>Visit with pageProps callback using shared</button>
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
