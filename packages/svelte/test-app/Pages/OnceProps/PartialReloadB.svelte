<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  interface Props {
    foo: string
    bar: string
  }

  let { foo, bar }: Props = $props()
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>
<Link href="/once-props/partial-reload/a">Go to Partial Reload A</Link>
