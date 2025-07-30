import { useState } from 'react'
import { Link } from '@inertiajs/react'
import type { Method } from '@inertiajs/core'

export default () => {
  const [method, setMethod] = useState<Method>('get')
  const [href, setHref] = useState('/dump/get')
  const [data, setData] = useState({ foo: 'bar' })
  const [headers, setHeaders] = useState({ 'X-Custom-Header': 'value' })
  const [prefetch, setPrefetch] = useState<boolean | string>(false)
  const [cacheFor, setCacheFor] = useState<number | string>(0)

  const change = () => {
    setMethod('post' as Method)
    setHref('/dump/post')
    setData({ foo: 'baz' })
    setHeaders({ 'X-Custom-Header': 'new-value' })
  }

  const enablePrefetch = () => {
    setPrefetch('hover')
    setCacheFor('1s')
  }

  return (
    <div>
      <span className="text">
        This page demonstrates reactivity in Inertia links. Click the button to change the link properties.
      </span>

      <Link method={method} href={href} data={data} headers={headers}>
        Submit
      </Link>

      <button onClick={change}>Change Link Props</button>

      <Link href="/dump/get" prefetch={prefetch as any} cacheFor={cacheFor}>
        Prefetch Link
      </Link>

      <button onClick={enablePrefetch}>Enable Prefetch (1s cache)</button>
    </div>
  )
}
