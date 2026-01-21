<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  let name = $state('')
  let remember = $state(false)
  let untracked = $state('')
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" name="full_name" bind:value={name} />
  </label>
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={remember} />
  </label>
  <label>
    Untracked
    <input type="text" id="untracked" name="untracked" bind:value={untracked} />
  </label>

  <a href="/dump/get" use:inertia class="link">Navigate away</a>
</div>
