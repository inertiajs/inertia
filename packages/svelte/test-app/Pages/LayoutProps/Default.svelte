<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout = AppLayout
</script>

<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<div>
  <h2>Default Layout Props Page</h2>
  <p>This page does not set any layout props. All defaults should apply.</p>

  <nav>
    <Link href="/layout-props/static">Go to Static Page</Link>
  </nav>
</div>
