import { Deferred, Link, router, usePage } from '@inertiajs/react'

const Users = () => {
  const { users } = usePage<{ users?: { text: string } }>().props
  return <div>{users?.text}</div>
}

const Stats = () => {
  const { stats } = usePage<{ stats?: { text: string } }>().props
  return <div>{stats?.text}</div>
}

const Activity = () => {
  const { activity } = usePage<{ activity?: { text: string } }>().props
  return <div>{activity?.text}</div>
}

export default () => {
  const { id } = usePage<{ id: string }>().props

  return (
    <>
      <div>Page: {id}</div>

      <Deferred data="users" fallback={<div>Loading users...</div>}>
        <Users />
      </Deferred>

      <Deferred data="stats" fallback={<div>Loading stats...</div>}>
        <Stats />
      </Deferred>

      <Deferred data="activity" fallback={<div>Loading activity...</div>}>
        <Activity />
      </Deferred>

      <Link href="/deferred-props/rapid-navigation/a">Page A</Link>
      <Link href="/deferred-props/rapid-navigation/b">Page B</Link>
      <Link href="/deferred-props/rapid-navigation/c">Page C</Link>
      <Link href="/deferred-props/page-1">Navigate Away</Link>

      <button
        onClick={() => {
          const shouldNavigate = confirm('Navigate away?')
          if (shouldNavigate) {
            router.visit('/deferred-props/page-2')
          }
        }}
      >
        Navigate with onBefore
      </button>

      <button onClick={() => router.reload()}>Plain reload</button>

      <button onClick={() => router.visit(`/deferred-props/rapid-navigation/${id}?foo=bar`)}>Add query param</button>

      <button onClick={() => router.prefetch('/deferred-props/page-1')}>Prefetch Page 1</button>
    </>
  )
}
