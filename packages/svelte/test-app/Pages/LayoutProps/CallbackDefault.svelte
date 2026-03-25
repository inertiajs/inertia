<script module lang="ts">
  export const layout = (props: { userName: string }) => ({
    title: 'Profile: ' + props.userName,
    showSidebar: false,
  })
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Callback Default Layout Page</h2>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
