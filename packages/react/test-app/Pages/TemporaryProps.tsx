import { Link } from '@inertiajs/react'

export default function TemporaryProps({
  regular,
  tmp,
}: {
  regular?: number
  tmp?: number
}) {
  return (
    <>
      <div>regular is {regular ?? 'undefined'}</div>
      <div>tmp is {tmp ?? 'undefined'}</div>

      <Link href="/">homepage</Link>
    </>
  )
}
