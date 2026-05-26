<script lang="ts">
  import { InfiniteScroll } from '@inertiajs/svelte'
  import { tick } from 'svelte'
  import UserCard, { type User } from './UserCard.svelte'

  interface Props {
    users: { data: User[] }
  }

  let { users }: Props = $props()
  let show = $state(false)
  let cycleCount = $state(0)

  function lifecycleMarker() {
    console.log('marker mounted')
    return {
      destroy() {
        console.log('marker destroyed')
      },
    }
  }

  async function cycleMount() {
    show = true
    await tick()
    show = false
    cycleCount++
  }
</script>

<div>
  <button onclick={cycleMount}>Cycle Mount</button>
  <p id="cycle-count">Cycles: {cycleCount}</p>

  {#if show}
    <div use:lifecycleMarker style="display: none"></div>
    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      {#each users.data as user (user.id)}
        <UserCard {user} />
      {/each}
    </InfiniteScroll>
  {/if}
</div>
