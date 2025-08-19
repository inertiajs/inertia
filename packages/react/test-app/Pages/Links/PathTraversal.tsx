import { Link } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <Link href="../">Up one level</Link>
      <Link href="../../method">Up two levels and open method</Link>
      <Link href="../../../">Up three levels</Link>
    </div>
  )
}
