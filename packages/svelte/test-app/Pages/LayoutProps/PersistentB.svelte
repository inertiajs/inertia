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
    title: 'Persistent Page B',
  })

  setLayoutPropsFor('content', {
    padding: 'xl',
  })
</script>

<div>
  <h2>Persistent Page B</h2>

  <nav>
    <Link href="/layout-props/persistent-a">Go to Page A</Link>
  </nav>
</div>
