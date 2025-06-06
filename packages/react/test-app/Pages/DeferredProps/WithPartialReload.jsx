import { Deferred, Link, router, usePage } from '@inertiajs/react'

const WithPartialReload = ({ withOnly, withExcept }) => {
  const handleTriggerPartialReload = () => {
    router.reload({
      only: withOnly,
      except: withExcept,
    })
  }

  return (
    <div>
      <Deferred data="users" fallback={<span>Loading...</span>}>
        <DeferredUsers />
      </Deferred>
      <button onClick={handleTriggerPartialReload}>Trigger a partial reload</button>
      <Link href="/deferred-props/page-1" prefetch="hover">
        Prefetch
      </Link>
    </div>
  )
}

const DeferredUsers = () => {
  const props = usePage().props

  return (
    <div>
      {props.users.map((user) => (
        <span key={user.id}>{user.name}</span>
      ))}
    </div>
  )
}

export default WithPartialReload
