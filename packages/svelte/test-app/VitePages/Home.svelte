<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface Props {
    example: string
  }

  let { example }: Props = $props()
</script>

<div>
  <h1 data-testid="vite-title">Vite Plugin Test Page</h1>
  <p data-testid="vite-example">Example: {example}</p>
  <Link href="/auto/props" data-testid="props-link">Go to Props</Link>
</div>
