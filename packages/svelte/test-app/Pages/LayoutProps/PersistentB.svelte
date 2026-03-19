<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: [AppLayout, { title: 'Persistent Page B' }],
    content: [ContentLayout, { padding: 'xl' }],
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
