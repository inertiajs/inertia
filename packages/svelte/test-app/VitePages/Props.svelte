<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface Props {
    foo: string
    count: number
    items: string[]
  }

  let { foo, count, items }: Props = $props()
</script>

<div>
  <h1 data-testid="props-title">Vite Props Page</h1>
  <p data-testid="foo">foo: {foo}</p>
  <p data-testid="count">count: {count}</p>
  <p data-testid="items">items: {items.join(', ')}</p>
  <Link href="/auto" data-testid="home-link">Back to Home</Link>
</div>
