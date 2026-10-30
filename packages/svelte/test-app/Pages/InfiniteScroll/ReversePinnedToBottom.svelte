<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'

  interface Props {
    users: { data: { id: number; name: string }[] }
  }

  let { users }: Props = $props()

  let reversedUsers = $derived([...users.data].reverse())

  let container: HTMLDivElement = $state(null!)

  // Pins the container to its bottom whenever its content changes, the way a chat transcript follows its newest message
  $effect(() => {
    const observer = new MutationObserver(() => {
      container.scrollTop = container.scrollHeight - container.clientHeight
    })

    observer.observe(container, { childList: true, subtree: true })

    return () => observer.disconnect()
  })
</script>

<div style="display: flex; flex-direction: column; height: 100vh">
  <div bind:this={container} data-testid="scroll-container" style="flex: 1; overflow-y: auto">
    <InfiniteScroll data="users" style="display: grid; gap: 4px; padding: 20px" reverse>
      {#each reversedUsers as user (user.id)}
        <div data-user-id={user.id} style="height: 20.25px; border: 1px solid #ddd; font-size: 13px">
          {user.name}
        </div>
      {/each}
    </InfiniteScroll>
  </div>
</div>
