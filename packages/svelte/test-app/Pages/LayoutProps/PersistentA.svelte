<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: AppLayout,
    content: ContentLayout,
  }
  export const layoutProps = (layout: (...args: unknown[]) => void) => {
    layout({ title: 'Persistent Page A' })
    layout('content', { padding: 'lg' })
  }
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Persistent Page A</h2>

  <nav>
    <Link href="/layout-props/persistent-b">Go to Page B</Link>
  </nav>
</div>
