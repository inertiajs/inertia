import { router } from '@inertiajs/react'
import { useState } from 'react'

export default ({ foo, bar }) => {
  const [replaced, setReplaced] = useState(0)

  const replace = () => {
    router.replace({
      preserveState: true,
      props: (props) => ({ ...props, foo: 'foo from client' }),
      onSuccess: () => setReplaced(replaced + 1),
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
      <div>Replaced: {replaced}</div>
    </div>
  )
}
