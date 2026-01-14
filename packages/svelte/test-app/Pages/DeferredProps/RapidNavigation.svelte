<script lang="ts">
  import { Deferred, Link, router, page } from '@inertiajs/svelte'

  $: id = $page.props.id as string
  $: users = $page.props.users as { text: string } | undefined
  $: stats = $page.props.stats as { text: string } | undefined
  $: activity = $page.props.activity as { text: string } | undefined

  function handleOnBeforeClick() {
    const shouldNavigate = confirm('Navigate away?')
    if (shouldNavigate) {
      router.visit('/deferred-props/page-2')
    }
  }
</script>

<div>Page: {id}</div>

<Deferred data="users">
  <div slot="fallback">Loading users...</div>
  <div>{users?.text}</div>
</Deferred>

<Deferred data="stats">
  <div slot="fallback">Loading stats...</div>
  <div>{stats?.text}</div>
</Deferred>

<Deferred data="activity">
  <div slot="fallback">Loading activity...</div>
  <div>{activity?.text}</div>
</Deferred>

<Link href="/deferred-props/rapid-navigation/a">Page A</Link>
<Link href="/deferred-props/rapid-navigation/b">Page B</Link>
<Link href="/deferred-props/rapid-navigation/c">Page C</Link>
<Link href="/deferred-props/page-1">Navigate Away</Link>

<button on:click={handleOnBeforeClick}>Navigate with onBefore</button>

<button on:click={() => router.reload()}>Plain reload</button>

<button on:click={() => router.visit(`/deferred-props/rapid-navigation/${id}?foo=bar`)}>Add query param</button>

<button on:click={() => router.prefetch('/deferred-props/page-1')}>Prefetch Page 1</button>
