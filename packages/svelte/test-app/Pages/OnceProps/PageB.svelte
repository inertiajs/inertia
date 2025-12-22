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
<Link href="/once-props/page-a">Go to Page A</Link>
<button onclick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
