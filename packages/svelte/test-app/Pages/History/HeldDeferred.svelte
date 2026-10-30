<script lang="ts">
  import { interceptors } from '@inertiajs/core'
  import { Deferred, Link } from '@inertiajs/svelte'

  let { page, comments }: { page: string; comments?: string } = $props()

  $effect(() => {
    if (page !== 'post') {
      return
    }

    return interceptors.onVisitResponse(async (visit, response) => {
      if (visit.deferredProps) {
        await new Promise<void>((resolve) => (window.releaseHeldResponse = resolve))
      }

      return response
    })
  })
</script>

<div>This is the {page} page.</div>

<Link href="/history/held-deferred/post">Open the post</Link>
<button onclick={() => window.releaseHeldResponse?.()}>Release held response</button>

{#if page === 'post'}
  <Deferred data="comments">
    {#snippet fallback()}
      <div>Loading comments...</div>
    {/snippet}
    <div>{comments}</div>
  </Deferred>
{/if}
