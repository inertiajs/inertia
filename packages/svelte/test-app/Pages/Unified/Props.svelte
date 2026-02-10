<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  export let foo: string
  export let count: number
  export let items: string[]
</script>

<div>
  <h1>Unified Props Test</h1>
  <p id="foo">Foo: {foo}</p>
  <p id="count">Count: {count}</p>
  <p id="items">Items: {items.join(', ')}</p>
  <a href="/unified/navigate" use:inertia>Navigate</a>
</div>
