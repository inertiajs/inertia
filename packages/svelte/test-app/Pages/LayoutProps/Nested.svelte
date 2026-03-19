<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = [
    [AppLayout, { title: 'Nested Layouts', showSidebar: true }],
    [ContentLayout, { padding: 'lg' }],
  ]
  export const layoutProps = { theme: 'dark', maxWidth: 'xl' }
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Nested Layouts with Static Props</h2>
  <p>This page uses nested layouts with static props in tuple format.</p>
  <p>AppLayout: title="Nested Layouts", sidebar visible, theme="dark" (from layoutProps)</p>
  <p>ContentLayout: padding="lg" (static), maxWidth="xl" (from layoutProps)</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
