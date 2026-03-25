<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: { component: AppLayout, props: { title: 'Named Object Page', showSidebar: false, theme: 'dark' } },
    content: { component: ContentLayout, props: { padding: 'sm', maxWidth: '4xl' } },
  }
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Named Object Layout Page</h2>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
