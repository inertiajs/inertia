<script module lang="ts">
  import SiteLayout from '@/Layouts/SiteLayout.svelte'
  import type { Component } from 'svelte'

  export const layout = (h: (component: Component, children: Component[]) => Component, page: Component) =>
    h(SiteLayout, [page])
</script>

<script lang="ts">
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">Simple Persistent Layout - Page A</span>
  <a href="/persistent-layouts/render-function/simple/page-b" use:inertia>Page B</a>
</div>
