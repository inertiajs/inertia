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

  setLayoutProps({
    title: 'Persistent Page A',
  })

  setLayoutPropsFor('content', {
    padding: 'lg',
  })
</script>

<div>
  <h2>Persistent Page A</h2>

  <nav>
    <Link href="/layout-props/persistent-b">Go to Page B</Link>
  </nav>
</div>
