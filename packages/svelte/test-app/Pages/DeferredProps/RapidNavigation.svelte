<script lang="ts">
  import { Deferred, Link, router, page } from '@inertiajs/svelte'

  let id = $derived(page.props.id as string)
  let users = $derived(page.props.users as { text: string } | undefined)
  let stats = $derived(page.props.stats as { text: string } | undefined)
  let activity = $derived(page.props.activity as { text: string } | undefined)

  function handleOnBeforeClick() {
    const shouldNavigate = confirm('Navigate away?')
    if (shouldNavigate) {
      router.visit('/deferred-props/page-2')
    }
  }
</script>

<div>Page: {id}</div>

<Deferred data="users">
  {#snippet fallback()}
    <div>Loading users...</div>
  {/snippet}
  <div>{users?.text}</div>
</Deferred>

<Deferred data="stats">
  {#snippet fallback()}
    <div>Loading stats...</div>
  {/snippet}
  <div>{stats?.text}</div>
</Deferred>

<Deferred data="activity">
  {#snippet fallback()}
    <div>Loading activity...</div>
  {/snippet}
  <div>{activity?.text}</div>
</Deferred>

<Link href="/deferred-props/rapid-navigation/a">Page A</Link>
<Link href="/deferred-props/rapid-navigation/b">Page B</Link>
<Link href="/deferred-props/rapid-navigation/c">Page C</Link>
<Link href="/deferred-props/page-1">Navigate Away</Link>

<button onclick={handleOnBeforeClick}>Navigate with onBefore</button>

<button onclick={() => router.reload()}>Plain reload</button>

<button onclick={() => router.visit(`/deferred-props/rapid-navigation/${id}?foo=bar`)}>Add query param</button>

<button onclick={() => router.prefetch('/deferred-props/page-1')}>Prefetch Page 1</button>
