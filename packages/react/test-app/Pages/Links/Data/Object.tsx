import { Link } from '@inertiajs/react'

export default (props) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates passing data through plain objects</span>

      <Link method="get" href="/dump/get" data={{ foo: 'get' }} className="get">
        GET Link
      </Link>
      <Link as="button" method="post" href="/dump/post" data={{ bar: 'post' }} className="post">
        POST Link
      </Link>
      <Link as="button" method="put" href="/dump/put" data={{ baz: 'put' }} className="put">
        PUT Link
      </Link>
      <Link as="button" method="patch" href="/dump/patch" data={{ foo: 'patch' }} className="patch">
        PATCH Link
      </Link>
      <Link as="button" method="delete" href="/dump/delete" data={{ bar: 'delete' }} className="delete">
        DELETE Link
      </Link>

      <Link href="/dump/get" data={{ a: ['b', 'c'] }} className="qsaf-default">
        QSAF Defaults
      </Link>
      <Link href="/dump/get" data={{ a: ['b', 'c'] }} queryStringArrayFormat="indices" className="qsaf-indices">
        QSAF Indices
      </Link>
      <Link href="/dump/get" data={{ a: ['b', 'c'] }} queryStringArrayFormat="brackets" className="qsaf-brackets">
        QSAF Brackets
      </Link>
    </div>
  )
}
