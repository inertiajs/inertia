<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div class="space-y-2">
  <a use:inertia href="../">
    Up one level
  </a>

  <a use:inertia href="../../method">
    Up two levels and open method
  </a>

  <a use:inertia href="../../../">
    Up three levels
  </a>
</div>
