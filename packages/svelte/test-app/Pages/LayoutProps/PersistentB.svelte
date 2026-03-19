<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: AppLayout,
    content: ContentLayout,
  }
  export const layoutProps = (layout: (...args: unknown[]) => void) => {
    layout({ title: 'Persistent Page B' })
    layout('content', { padding: 'xl' })
  }
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Persistent Page B</h2>

  <nav>
    <Link href="/layout-props/persistent-a">Go to Page A</Link>
  </nav>
</div>
