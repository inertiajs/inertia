<script context="module">
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = (h, page) => h(SiteLayout, [page])
</script>

<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">Simple Persistent Layout - Page A</span>
  <a href="/persistent-layouts/render-function/simple/page-b" use:inertia>Page B</a>
</div>
