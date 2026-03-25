<script module lang="ts">
  export const layout = () => ({
    title: 'Static Callback Title',
    showSidebar: false,
  })
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Static Callback Layout Page</h2>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
