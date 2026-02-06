<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout = [AppLayout, { title: 'Static Props Page', theme: 'dark', showSidebar: false }]
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Static Layout Props Page</h2>
  <p>This page uses static props defined in the layout tuple.</p>
  <p>The title should be "Static Props Page", sidebar should be hidden, theme should be "dark".</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
