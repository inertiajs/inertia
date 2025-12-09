import { Link } from '@inertiajs/react'

export default ({ userPermissions, bar }: { userPermissions: string; bar: string }) => {
  return (
    <>
      <p id="permissions">Permissions: {userPermissions}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/custom-key/b">Go to Custom Key Page B</Link>
    </>
  )
}
