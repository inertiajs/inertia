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

      <button onClick={() => router.reload({ except: ['stats'] })}>Reload with except</button>

      <button onClick={() => router.visit('/deferred-props/rapid-navigation/b', { only: ['users'] })}>
        Visit B with only
      </button>

      <button onClick={() => router.visit(`/deferred-props/rapid-navigation/${filter}`)}>Re-visit same URL</button>

      <button onClick={() => router.reload()}>Plain reload</button>

      <button onClick={() => router.reload({ only: ['users'], except: ['stats'] })}>Reload with only and except</button>

      <button onClick={() => router.visit('/deferred-props/rapid-navigation/b', { except: ['stats'] })}>
        Visit B with except
      </button>

      <button
        onClick={() => router.visit('/deferred-props/rapid-navigation/b', { only: ['users'], except: ['stats'] })}
      >
        Visit B with only and except
      </button>

      <button onClick={() => router.prefetch('/deferred-props/rapid-navigation/b')}>Prefetch Filter B</button>

      <button onClick={() => router.prefetch('/deferred-props/page-1')}>Prefetch Page 1</button>
    </>
  )
}
