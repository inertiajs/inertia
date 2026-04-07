<script module lang="ts">
  export const layout = () => ({
    title: 'Function Prop Title',
    showSidebar: false,
    formatName: (name: string) => `Hello, ${name}`,
  })
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Callback Function Prop Page</h2>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
