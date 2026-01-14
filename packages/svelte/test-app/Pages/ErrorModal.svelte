<script lang="ts">
  import { config, router } from '@inertiajs/svelte'

  export let dialog: boolean = false

  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }

  if (dialog) {
    config.set('future.useDialogForErrorModal', true)
  }
</script>

<div>
  <span
    on:click={invalidVisit}
    on:keydown={(e) => e.key === 'Enter' && invalidVisit()}
    role="button"
    tabindex="0"
    class="invalid-visit">Invalid Visit</span
  >
  <span
    on:click={invalidVisitJson}
    on:keydown={(e) => e.key === 'Enter' && invalidVisitJson()}
    role="button"
    tabindex="0"
    class="invalid-visit-json">Invalid Visit (JSON response)</span
  >
</div>
