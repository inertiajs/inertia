<script context="module" lang="ts">
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = SiteLayout
</script>

<script lang="ts">
  import { inertia, page } from '@inertiajs/svelte5'

  // Update props reactively when page changes
  $effect(() => {
    if (typeof window !== 'undefined') {
      window._inertia_page_props = $page.props
    }
  })
</script>

<div>
  <span class="text">Simple Persistent Layout - Page B</span>
  <a href="/persistent-layouts/shorthand/simple/page-a" use:inertia>Page A</a>
</div>
