<script lang="ts">
  import { Link } from '@inertiajs/svelte5'

  let href = '/sleep'

  const changeUrl = () => {
    href = '/something-else'
  }
</script>

<div>
  <button on:click={changeUrl}>Change URL</button>
  <Link {href} class="get">The Link</Link>
</div>
