<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout = AppLayout
</script>

<script lang="ts">
  import { Link, setLayoutProps } from '@inertiajs/svelte'

  // Call setLayoutProps directly (not in $effect to avoid infinite loops)
  setLayoutProps({
    title: 'Navigate Page',
    showSidebar: false,
    theme: 'dark',
  })
</script>

<div>
  <h2>Navigate Page</h2>
  <p>This page sets different layout props to test reset on navigation.</p>
  <p>Title should be "Navigate Page", sidebar hidden, theme dark.</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page (props should reset)</Link>
  </nav>
</div>
