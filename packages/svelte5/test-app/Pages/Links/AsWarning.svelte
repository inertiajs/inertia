<script lang="ts">
  import { Link } from '@inertiajs/svelte5'

  const { method } = $props()
</script>

<div>
  <span class="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

  <Link href="/example" {method} class="get">{method} Link</Link>
</div>
