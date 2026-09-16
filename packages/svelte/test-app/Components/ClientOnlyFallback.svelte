<script lang="ts">
  // Increments in the top-level script (not an $effect) because the fallback can be
  // unmounted in the same commit it's created in -- an $effect might never get to fire.
  if (typeof window !== 'undefined') {
    window._inertia_client_only_fallback_renders = (window._inertia_client_only_fallback_renders || 0) + 1
  }
</script>

<p data-testid="client-only-fallback">Loading widget...</p>
