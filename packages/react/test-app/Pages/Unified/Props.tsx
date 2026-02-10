import { Link } from '@inertiajs/react'

export default ({ foo, count, items }: { foo: string; count: number; items: string[] }) => {
  return (
    <div>
      <h1>Unified Props Test</h1>
      <p id="foo">Foo: {foo}</p>
      <p id="count">Count: {count}</p>
      <p id="items">Items: {items.join(', ')}</p>
      <Link href="/unified/navigate">Navigate</Link>
    </div>
  )
}
