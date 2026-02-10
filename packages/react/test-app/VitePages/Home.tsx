import { Link } from '@inertiajs/react'

export default ({ example }: { example: string }) => {
  return (
    <div>
      <h1 data-testid="vite-title">Vite Plugin Test Page</h1>
      <p data-testid="vite-example">Example: {example}</p>
      <Link href="/auto/props" data-testid="props-link">
        Go to Props
      </Link>
    </div>
  )
}
