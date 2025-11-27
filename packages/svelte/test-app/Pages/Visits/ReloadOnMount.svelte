<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  const { name } = $props()

  onMount(() => {
    router.reload({ only: ['name'] })
  })
</script>

<div>Name is {name}</div>
