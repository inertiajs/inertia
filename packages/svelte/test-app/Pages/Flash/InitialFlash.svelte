<script lang="ts">
  import { page, router } from '@inertiajs/svelte'

  let flashEvents: any[] = []

  router.on('flash', (e) => {
    flashEvents = [...flashEvents, e.detail.flash]
  })
</script>

<div>
  <span id="flash">{$page.flash ? JSON.stringify($page.flash) : 'no-flash'}</span>
  <span id="flash-events">{JSON.stringify(flashEvents)}</span>
</div>
