<script lang="ts">
  import { Deferred, Link, router, page } from '@inertiajs/svelte'

  $: filter = $page.props.filter as string
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

<div>Current filter: {filter}</div>

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

<Link href="/deferred-props/rapid-navigation/a">Filter A</Link>
<Link href="/deferred-props/rapid-navigation/b">Filter B</Link>
<Link href="/deferred-props/rapid-navigation/c">Filter C</Link>
<Link href="/deferred-props/page-1">Navigate Away</Link>

<button on:click={handleOnBeforeClick}>Navigate with onBefore</button>
