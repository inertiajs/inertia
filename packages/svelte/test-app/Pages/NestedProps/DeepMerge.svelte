<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    data: {
      items: { id: number; name: string }[]
      label: string
    }
  }

  let { data }: Props = $props()

  const loadMore = () => {
    router.reload({
      only: ['data'],
      data: { page: 2 },
    })
  }
</script>

<p id="items">{data.items.map((i) => i.name).join(', ')}</p>
<p id="label">Label: {data.label}</p>
<button onclick={loadMore}>Load More</button>
