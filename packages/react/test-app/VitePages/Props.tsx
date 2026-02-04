import { Link } from '@inertiajs/react'

export default ({ foo, count, items }: { foo: string; count: number; items: string[] }) => {
  return (
    <div>
      <h1 data-testid="props-title">Vite Props Page</h1>
      <p data-testid="foo">foo: {foo}</p>
      <p data-testid="count">count: {count}</p>
      <p data-testid="items">items: {items.join(', ')}</p>
      <Link href="/auto" data-testid="home-link">
        Back to Home
      </Link>
    </div>
  )
}
