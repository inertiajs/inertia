<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  interface Props {
    foo: string
    bar: string
  }

  let { foo, bar }: Props = $props()
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/ttl/b">Go to TTL Page B</Link>
<Link href="/once-props/ttl/c" prefetch="mount">Go to TTL Page C</Link>
<button onclick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
