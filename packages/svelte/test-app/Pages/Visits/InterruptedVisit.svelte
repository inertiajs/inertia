<script lang="ts">
  import { Link, router } from '@inertiajs/svelte'

  let { user, status }: { user: string; status: string } = $props()

  const postComment = () => router.post('/visits/interrupted-visit', {}, { only: ['status'] })
</script>

<div>
  <div>Signed in as {user}</div>
  <div>Status: {status}</div>

  <Link href="/visits/interrupted-visit/held">Open the held page</Link>
  <Link href="/visits/interrupted-visit/clear-history">Open the history clearing page</Link>
  <button onclick={postComment}>Post comment</button>
  <button onclick={() => window.releaseHeldComponent?.()}>Release held component</button>
</div>
