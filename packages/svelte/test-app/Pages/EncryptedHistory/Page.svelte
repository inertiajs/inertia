<script lang="ts">
  import { Link } from '@inertiajs/svelte'

  let { title, token }: { title: string; token?: string } = $props()
</script>

<Link href="/encrypted-history/public">Public page</Link>
<Link href="/encrypted-history/private">Private page</Link>
<Link href="/encrypted-history/logout">Log out</Link>

<h1>{title}</h1>

{#if token}
  <div>Token: <span id="token">{token}</span></div>
{/if}
