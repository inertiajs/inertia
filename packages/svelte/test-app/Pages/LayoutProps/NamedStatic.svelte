<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: [AppLayout, { theme: 'dark' }],
    content: [ContentLayout, { padding: 'sm' }],
  }
</script>

<script lang="ts">
  import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/svelte'

  setLayoutProps({
    title: 'Named Layouts with Static Props',
  })

  setLayoutPropsFor('content', {
    maxWidth: '4xl',
  })
</script>

<div>
  <h2>Named Layouts with Static Props</h2>
  <p>This page uses named layouts with both static and dynamic props.</p>
  <p>AppLayout: title from setLayoutProps, theme="dark" (static)</p>
  <p>ContentLayout: padding="sm" (static), maxWidth="4xl" (from setLayoutPropsFor)</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
