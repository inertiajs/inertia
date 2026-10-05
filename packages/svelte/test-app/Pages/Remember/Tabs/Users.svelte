<script lang="ts">
  import { inertia, useRemember } from '@inertiajs/svelte'
  import Notes from '../Components/Notes.svelte'

  const users = [
    { id: 1, name: 'User One' },
    { id: 2, name: 'User Two' },
    { id: 3, name: 'User Three' },
  ]

  const selection = useRemember({ ids: [] as number[] }, 'Users/Selected')

  let showNotes = $state(false)
</script>

<div>
  <nav>
    <a href="/remember/tabs/users" use:inertia>Users</a>
    <a href="/remember/tabs/teams" use:inertia>Teams</a>
    <a href="/non-inertia">Navigate off-site</a>
  </nav>

  <h1>Users</h1>
  <p id="selected">{selection.ids.length} selected</p>

  {#each users as user (user.id)}
    <label>
      <input type="checkbox" value={user.id} bind:group={selection.ids} />
      {user.name}
    </label>
  {/each}

  <button onclick={() => (showNotes = !showNotes)}>Toggle notes</button>
  {#if showNotes}
    <Notes />
  {/if}
</div>
