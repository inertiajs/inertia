<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout = (props: { userName: string }) => [
    AppLayout,
    { title: 'Profile: ' + props.userName, showSidebar: false },
  ]
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Callback Layout Props Page</h2>
  <p>This page uses a layout callback to derive props from page props.</p>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
