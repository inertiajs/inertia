<script module lang="ts">
  export const layout = () => ({
    formatTitle: (name: string) => `Profile: ${name}`,
    formatDate: (date: string) => new Date(date).toLocaleDateString(),
  })
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Callback All Function Props Page</h2>

  <nav>
    <Link href="/layout-props/basic">Go to Basic Page</Link>
  </nav>
</div>
