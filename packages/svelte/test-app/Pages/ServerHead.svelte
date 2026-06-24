<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  let { foo, next }: { foo: string; next: string } = $props()

  function replaceHead() {
    router.replaceProp('head', [
      '<title data-inertia="title">Replaced Head</title>',
      '<meta data-inertia="description" name="description" content="Replaced description">',
    ])
  }
</script>

<div>
  <h1>Server Head</h1>
  <p id="foo">{foo}</p>
  <button onclick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
  <button onclick={replaceHead}>Replace head client-side</button>
  <Link href={next}>Next server head page</Link>
</div>
