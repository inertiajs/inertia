<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let users: { data: { id: number; name: string }[]; meta: { page: number; perPage: number } } = {
    data: [],
    meta: { page: 1, perPage: 10 },
  }

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
  <button on:click={loadMore}>Load More</button>
</div>
