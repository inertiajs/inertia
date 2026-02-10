<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let foo: string
  export let count: number
  export let items: string[]
</script>

<div>
  <h1 data-testid="props-title">Vite Props Page</h1>
  <p data-testid="foo">foo: {foo}</p>
  <p data-testid="count">count: {count}</p>
  <p data-testid="items">items: {items.join(', ')}</p>
  <Link href="/auto" data-testid="home-link">Back to Home</Link>
</div>
