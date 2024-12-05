import { router } from '@inertiajs/vue3'

export default ({ foo, bar }) => {
  const replace = () => {
    router.replace({
      props: (props) => ({ ...props, foo: 'foo from client' }),
    })
  }

  const push = () => {
    router.push({
      url: '/client-side-visit-2',
      component: 'ClientSideVisit/Page2',
      props: { baz: 'baz from client' },
    })
  }

  return (
    <div>
      <div>{foo}</div>
      <div>{bar}</div>
      <button onClick={replace}>Replace</button>
      <button onClick={push}>Push</button>
    </div>
  )
}
