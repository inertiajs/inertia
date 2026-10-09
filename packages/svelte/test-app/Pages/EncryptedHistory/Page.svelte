<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  export let title: string
  export let token: string | undefined = undefined
</script>

<Link href="/encrypted-history/public">Public page</Link>
<Link href="/encrypted-history/private">Private page</Link>
<Link href="/encrypted-history/logout">Log out</Link>

<h1>{title}</h1>

{#if token}
  <div>Token: <span id="token">{token}</span></div>
{/if}
