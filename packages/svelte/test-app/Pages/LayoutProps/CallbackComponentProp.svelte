<script module lang="ts">
  export const layout = () => ({
    title: 'Component Prop Title',
    component: 'UserCard',
    showSidebar: false,
  })
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Callback Component Prop Page</h2>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
