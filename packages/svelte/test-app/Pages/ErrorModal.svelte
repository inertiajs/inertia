<script>
  import { router } from '@inertiajs/svelte'

  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }
</script>

<div>
  <span on:click={invalidVisit} class="invalid-visit">Invalid Visit</span>
  <span on:click={invalidVisitJson} class="invalid-visit-json">Invalid Visit (JSON response)</span>
</div>
