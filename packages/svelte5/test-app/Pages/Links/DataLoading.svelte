<script lang="ts">
  import { inertia } from '@inertiajs/svelte5'
</script>

<div>
  <a href="/sleep" use:inertia class="get">First</a>
  <a href="/sleep" use:inertia class="get">Second</a>
</div>
