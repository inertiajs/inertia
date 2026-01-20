<script lang="ts">
  import { Deferred, page, router } from '@inertiajs/svelte'

  export let data: string | undefined

  let flashEventCount = 0

  router.on('flash', () => {
    flashEventCount++
  })
</script>

<div>
  <span id="flash">{JSON.stringify($page.flash)}</span>
  <span id="flash-event-count">{flashEventCount}</span>

  <Deferred data="data">
    <div id="loading" slot="fallback">Loading...</div>
    <div id="data">{data}</div>
  </Deferred>
</div>
