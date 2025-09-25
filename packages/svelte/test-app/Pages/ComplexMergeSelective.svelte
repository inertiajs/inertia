<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let mixed: {
    name: string
    users: string[]
    chat: { data: number[] }
  }

  const reload = () => {
    router.reload({
      only: ['mixed'],
    })
  }
</script>

<div>name is {mixed.name}</div>
<div>users: {mixed.users.join(', ')}</div>
<div>chat.data: {mixed.chat.data.join(', ')}</div>
<button on:click={reload}>Reload</button>