<script context="module">
  import NestedLayout from '@/Layouts/NestedLayout.svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = (h, page) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  }
</script>

<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">Nested Persistent Layout - Page A</span>
  <a href="/persistent-layouts/render-function/nested/page-b" use:inertia>Page B</a>
</div>
