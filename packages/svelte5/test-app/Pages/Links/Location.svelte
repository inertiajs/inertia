<script lang="ts">
  import { inertia } from '@inertiajs/svelte5'
</script>

<div>
  <span class="text">This is the links page that demonstrates location visits inertia-links</span>

  <a href="/location" use:inertia={{ replace: true }} class="example">Location visit</a>
</div>
