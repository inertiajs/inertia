import { useDeferred } from '@inertiajs/react'

export default () => {
  const { organizations } = useDeferred('organizations')

  return organizations.map((org) => (
    <div key={org.id}>
      <p>
        #{org.id}: {org.name} ({org.url})
      </p>
    </div>
  ))
}
