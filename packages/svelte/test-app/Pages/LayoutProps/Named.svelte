<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: AppLayout,
    content: ContentLayout,
  }
  export const layoutProps = (layout: (...args: unknown[]) => void) => {
    layout({ title: 'Named Layouts Page' })
    layout('app', { showSidebar: true, theme: 'light' })
    layout('content', { padding: 'xl', maxWidth: '2xl' })
  }
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Named Layouts Page</h2>
  <p>This page uses named layouts with setLayoutPropsFor.</p>
  <p>App layout should have sidebar visible and light theme.</p>
  <p>Content layout should have xl padding and 2xl maxWidth.</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
