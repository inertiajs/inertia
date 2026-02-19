<script lang="ts">
  import { usePage } from '@inertiajs/svelte'

  const page = usePage()
</script>

<div>
  <span id="current-url">{page.url}</span>
  <span id="target-text">This is the target page</span>
</div>
