<script lang="ts">
  import { counts } from './whenMountedCounts'

  // Counts in the top-level script, not an $effect, since the fallback can unmount in the same commit
  counts.fallbackRenders++
</script>

<p id="when-mounted-fallback">Loading widget...</p>
