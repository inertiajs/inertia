import type { CacheForOption, LinkPrefetchOption, Method } from '@inertiajs/core'
import { Link } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [method, setMethod] = useState<Method>('get')
  const [href, setHref] = useState('/dump/get')
  const [data, setData] = useState({ foo: 'bar' })
  const [headers, setHeaders] = useState({ 'X-Custom-Header': 'value' })
  const [prefetch, setPrefetch] = useState<boolean | LinkPrefetchOption>(false)
  const [cacheFor, setCacheFor] = useState<CacheForOption>(0)

  const change = () => {
    setMethod('post')
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

      <Link href="/dump/get" prefetch={prefetch} cacheFor={cacheFor}>
        Prefetch Link
      </Link>

      <button onClick={enablePrefetch}>Enable Prefetch (1s cache)</button>
    </div>
  )
}
