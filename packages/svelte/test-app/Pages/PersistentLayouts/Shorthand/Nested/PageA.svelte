<script context="module">
  import NestedLayout from '@/Layouts/NestedLayout.svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = [SiteLayout, NestedLayout]
</script>

<script>
  import { inertia, page } from '@inertiajs/svelte'

  window._inertia_page_props = $page.props
</script>

<div>
  <span class="text">Nested Persistent Layout - Page A</span>
  <a href="/persistent-layouts/shorthand/nested/page-b" use:inertia>Page B</a>
</div>
