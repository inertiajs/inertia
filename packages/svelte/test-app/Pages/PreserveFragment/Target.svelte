<script lang="ts">
  import { page } from '@inertiajs/svelte'
</script>

<div>
  <span id="current-url">{$page.url}</span>
  <span id="target-text">This is the target page</span>
</div>
