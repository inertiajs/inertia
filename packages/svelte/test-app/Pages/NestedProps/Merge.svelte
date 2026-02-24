<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    feed: {
      posts: { id: number; title: string }[]
      meta: { page: number }
    }
  }

  let { feed }: Props = $props()

  const loadMore = () => {
    router.reload({
      only: ['feed'],
      data: { page: feed.meta.page + 1 },
    })
  }
</script>

<p id="posts">{feed.posts.map((p) => p.title).join(', ')}</p>
<p id="meta">Page: {feed.meta.page}</p>
<button onclick={loadMore}>Load More</button>
