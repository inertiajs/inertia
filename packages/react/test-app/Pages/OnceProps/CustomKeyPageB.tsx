import { Link } from '@inertiajs/react'

export default ({ permissions, bar }: { permissions: string; bar: string }) => {
  return (
    <>
      <p id="permissions">Permissions: {permissions}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/custom-key/a">Go to Custom Key Page A</Link>
    </>
  )
}
