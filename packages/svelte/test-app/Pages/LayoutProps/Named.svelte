<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: AppLayout,
    content: ContentLayout,
  }
</script>

<script lang="ts">
  import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/svelte'

  // Call setLayoutProps directly (not in $effect to avoid infinite loops)
  setLayoutProps({
    title: 'Named Layouts Page',
  })

  setLayoutPropsFor('app', {
    showSidebar: true,
    theme: 'light',
  })

  setLayoutPropsFor('content', {
    padding: 'xl',
    maxWidth: '2xl',
  })
</script>

<div>
  <h2>Named Layouts Page</h2>
  <p>This page uses named layouts.</p>
  <p>AppLayout: title from setLayoutProps</p>
  <p>ContentLayout: maxWidth="2xl" (from setLayoutPropsFor)</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
