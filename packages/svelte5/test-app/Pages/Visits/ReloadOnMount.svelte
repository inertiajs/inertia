<script lang="ts">
  import { router } from '@inertiajs/svelte5'
  import { onMount } from 'svelte'

  export let name

  onMount(() => {
    router.reload({ only: ['name'] })
  })
</script>

<div>Name is {name}</div>
