<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  interface Props {
    foo: string | undefined
    bar: string
  }

  let { foo, bar }: Props = $props()
</script>

<p id="foo">Foo: {foo ?? 'not loaded'}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/optional/b">Go to Optional Page B</Link>
<button onclick={() => router.reload({ only: ['foo'] })}>Load foo</button>
