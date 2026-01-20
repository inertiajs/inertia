import { router } from '@inertiajs/react'

export default ({ foo, bar }: { foo: string; bar: string }) => {
  const pushWithoutPreserving = () => {
    router.push({
      url: '/once-props/client-side-visit',
      component: 'OnceProps/ClientSideVisit',
      props: { bar: 'bar-updated' },
    })
  }

  const pushWithOnceProps = () => {
    router.push({
      url: '/once-props/client-side-visit',
      component: 'OnceProps/ClientSideVisit',
      props: (currentProps, onceProps) => ({ ...onceProps, bar: 'bar-updated' }),
    })
  }

  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>
      <button onClick={pushWithoutPreserving}>Push without preserving</button>
      <button onClick={pushWithOnceProps}>Push with once props</button>
    </>
  )
}
