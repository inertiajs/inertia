<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout = [AppLayout, { title: 'Static Props Page', theme: 'dark', showSidebar: false }]
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Static Props Page</h2>
  <p>This page uses static props via tuple syntax.</p>
  <p>Title should be "Static Props Page" and theme should be "dark".</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
