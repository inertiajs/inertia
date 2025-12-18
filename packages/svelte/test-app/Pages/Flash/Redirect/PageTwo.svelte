<script context="module" lang="ts">
  import FlashLayout from '@/Layouts/FlashLayout.svelte'

  export const layout = FlashLayout
</script>

<script lang="ts">
  import { page } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">Page Two</span>
  <span class="flash">{JSON.stringify($page.flash)}</span>
</div>
