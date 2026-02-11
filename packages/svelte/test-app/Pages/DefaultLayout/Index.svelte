<script lang="ts">
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span id="text">DefaultLayout/Index</span>
  <a href="/default-layout/with-own-layout" use:inertia>With Own Layout</a>
  <a href="/default-layout/callback-excluded" use:inertia>Callback Excluded</a>
</div>
