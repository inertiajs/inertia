<script lang="ts">
  import { Deferred, page, router } from '@inertiajs/svelte'

  interface Props {
    data: string | undefined
  }

  let { data }: Props = $props()

  let flashEventCount = $state(0)

  router.on('flash', () => {
    flashEventCount++
  })
</script>

<div>
  <span id="flash">{JSON.stringify(page.flash)}</span>
  <span id="flash-event-count">{flashEventCount}</span>

  <Deferred data="data">
    {#snippet fallback()}
      <div id="loading">Loading...</div>
    {/snippet}
    <div id="data">{data}</div>
  </Deferred>
</div>
