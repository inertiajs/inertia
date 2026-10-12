import { Link, useHttp } from '@inertiajs/react'

export default () => {
  const upload = useHttp({})

  return (
    <div>
      <Link as="button" method="post" href="/dump/post">
        Same-origin Link
      </Link>
      <Link as="button" method="post" href="https://external.example/upload">
        Cross-origin Link
      </Link>
      <button onClick={() => upload.put('https://external.example/upload')}>Cross-origin HTTP</button>
    </div>
  )
}
