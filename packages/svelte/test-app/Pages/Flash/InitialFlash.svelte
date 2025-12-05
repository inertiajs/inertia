<script lang="ts">
  import { page } from '@inertiajs/svelte'
</script>

<div>
  <span id="flash">{$page.flash ? JSON.stringify($page.flash) : 'no-flash'}</span>
</div>
