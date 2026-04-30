<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }

  const invalidVisitXss = () => {
    router.post('/non-inertia/xss')
  }
</script>

<div>
  <span
    onclick={invalidVisit}
    onkeydown={(e) => e.key === 'Enter' && invalidVisit()}
    role="button"
    tabindex="0"
    class="invalid-visit">Invalid Visit</span
  >
  <span
    onclick={invalidVisitJson}
    onkeydown={(e) => e.key === 'Enter' && invalidVisitJson()}
    role="button"
    tabindex="0"
    class="invalid-visit-json">Invalid Visit (JSON response)</span
  >
  <span
    onclick={invalidVisitXss}
    onkeydown={(e) => e.key === 'Enter' && invalidVisitXss()}
    role="button"
    tabindex="0"
    class="invalid-visit-xss">Invalid Visit (XSS)</span
  >
</div>
