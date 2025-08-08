<script context="module" lang="ts">
  import NestedLayout from '@/Layouts/NestedLayout.svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'
  import type { ComponentType } from 'svelte'

  export const layout = (h: (component: ComponentType, children: ComponentType[]) => ComponentType, page: ComponentType) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  }
</script>

<script lang="ts">
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">Nested Persistent Layout - Page A</span>
  <a href="/persistent-layouts/render-function/nested/page-b" use:inertia>Page B</a>
</div>
