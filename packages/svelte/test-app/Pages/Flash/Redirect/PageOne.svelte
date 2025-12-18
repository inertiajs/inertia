<script context="module" lang="ts">
  import FlashLayout from '@/Layouts/FlashLayout.svelte'

  export const layout = FlashLayout
</script>

<script lang="ts">
  import { router } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">Page One</span>
  <button class="submit" on:click={() => router.post('/flash/redirect/submit')}>Submit</button>
</div>
