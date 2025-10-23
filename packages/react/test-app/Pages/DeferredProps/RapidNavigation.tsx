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
  const { filter } = usePage<{ filter: string }>().props

  return (
    <>
      <div>Current filter: {filter}</div>

      <Deferred data="users" fallback={<div>Loading users...</div>}>
        <Users />
      </Deferred>

      <Deferred data="stats" fallback={<div>Loading stats...</div>}>
        <Stats />
      </Deferred>

      <Deferred data="activity" fallback={<div>Loading activity...</div>}>
        <Activity />
      </Deferred>

      <Link href="/deferred-props/rapid-navigation/a">Filter A</Link>
      <Link href="/deferred-props/rapid-navigation/b">Filter B</Link>
      <Link href="/deferred-props/rapid-navigation/c">Filter C</Link>
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
    </>
  )
}
