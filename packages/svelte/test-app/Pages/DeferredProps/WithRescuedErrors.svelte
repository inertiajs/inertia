<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'

  interface Props {
    foo?: { text: string } | null
  }

  let { foo }: Props = $props()

  const retry = () => {
    router.reload({ only: ['foo'] })
  }
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}

  {#snippet rescue()}
    <div id="foo-error">Unable to load foo.</div>
  {/snippet}

  <div id="foo">{foo?.text}</div>
</Deferred>

<button type="button" onclick={retry}>Retry</button>
