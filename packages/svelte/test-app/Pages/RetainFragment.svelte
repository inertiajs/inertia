<script lang="ts">
  import { inertia, page, router } from '@inertiajs/svelte'

  const visitWithFragment = () => {
    router.visit('/retain-fragment/redirect#my-fragment')
  }
</script>

<div>
  <span id="current-url">{$page.url}</span>

  <a href="/retain-fragment/redirect#my-fragment" use:inertia id="link-with-fragment">Link with fragment</a>

  <a href={'#'} on:click|preventDefault={visitWithFragment} id="manual-visit-with-fragment"
    >Manual visit with fragment</a
  >
</div>
