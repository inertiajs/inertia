import { Link } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [href, setHref] = useState('/dump/get?step=one')

  return (
    <div>
      <button onClick={() => setHref('/dump/get?step=two')}>Change URL</button>
      <Link href={href}>The Link</Link>
    </div>
  )
}
