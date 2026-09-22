<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    foo: string
    bar: string
  }

  let { foo, bar }: Props = $props()

  const prefetch = (url: string) => router.prefetch(url, { method: 'get' }, {})
  const instantVisit = (url: string) => router.visit(url, { component: 'OnceProps/InstantPageB' })
</script>

<p id="foo">Foo: {foo}</p>
<p id="bar">Bar: {bar}</p>

<button onclick={() => prefetch('/once-props/instant/b')}>Prefetch Page B</button>
<button onclick={() => instantVisit('/once-props/instant/b')}>Instant visit to Page B</button>

<button onclick={() => prefetch('/once-props/instant/b?deferred=1')}>Prefetch Deferred Page B</button>
<button onclick={() => instantVisit('/once-props/instant/b?deferred=1')}>Instant visit to Deferred Page B</button>
