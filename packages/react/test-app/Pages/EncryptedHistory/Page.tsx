import { Link } from '@inertiajs/react'

export default ({ title, token }: { title: string; token?: string }) => {
  return (
    <>
      <Link href="/encrypted-history/public">Public page</Link>
      <Link href="/encrypted-history/private">Private page</Link>
      <Link href="/encrypted-history/logout">Log out</Link>

      <h1>{title}</h1>

      {token && (
        <div>
          Token: <span id="token">{token}</span>
        </div>
      )}
    </>
  )
}
