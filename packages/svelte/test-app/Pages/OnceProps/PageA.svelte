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
<Link href="/once-props/page-b">Go to Page B</Link>
<Link href="/once-props/page-c">Go to Page C</Link>
<Link href="/once-props/page-d" prefetch="mount">Go to Page D</Link>
<Link href="/once-props/page-e" prefetch="mount" cacheFor={1000}>Go to Page E (short cache)</Link>
<button onclick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
<button onclick={() => router.replaceProp('foo', 'replaced-foo')}>Replace foo</button>
