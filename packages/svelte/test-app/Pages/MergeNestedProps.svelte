<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    users?: { data: { id: number; name: string }[]; meta: { page: number; perPage: number } }
  }

  let {
    users = {
      data: [],
      meta: { page: 1, perPage: 10 },
    },
  }: Props = $props()

  const loadMore = () => {
    router.reload({
      only: ['users'],
      data: { page: users.meta.page + 1 },
    })
  }
</script>

<div>
  <p id="users">{users.data.map((user) => user.name).join(', ')}</p>
  <p id="meta">Page: {users.meta.page}, Per Page: {users.meta.perPage}</p>
  <button onclick={loadMore}>Load More</button>
</div>
