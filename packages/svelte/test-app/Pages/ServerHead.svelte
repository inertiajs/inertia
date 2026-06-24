<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  let { foo, next }: { foo: string; next: string } = $props()
</script>

<div>
  <h1>Server Head</h1>
  <p id="foo">{foo}</p>
  <button onclick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
  <Link href={next}>Next server head page</Link>
</div>
