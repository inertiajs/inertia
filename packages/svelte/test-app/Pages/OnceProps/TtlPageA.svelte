<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let foo: string
  export let bar: string
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/ttl-page-b">Go to TTL Page B</Link>
