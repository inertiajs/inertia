import { useState } from 'react'
import { Link } from '@inertiajs/react'

export default () => {
  const [method, setMethod] = useState('get')
  const [href, setHref] = useState('/dump/get')
  const [data, setData] = useState({ foo: 'bar' })
  const [headers, setHeaders] = useState({ 'X-Custom-Header': 'value' })
  const [prefetch, setPrefetch] = useState(false)
  const [cacheFor, setCacheFor] = useState(0)

  const change = () => {
    setMethod('post')
    setHref('/dump/post')
    setData({ foo: 'baz' })
    setHeaders({ 'X-Custom-Header': 'new-value' })
  }

  const changePrefetch = () => {
    setPrefetch('hover')
    setCacheFor('5s')
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

      <button onClick={changePrefetch}>Enable Prefetch</button>
    </div>
  )
}
