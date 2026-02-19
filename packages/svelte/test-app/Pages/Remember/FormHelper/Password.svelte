<script lang="ts">
  import { inertia, useForm } from '@inertiajs/svelte'

  const form = useForm('password-form', {
    username: '',
    password: '',
  }).dontRemember('password')
</script>

<div>
  <label>
    Username
    <input type="text" id="username" bind:value={form.username} />
  </label>
  <label>
    Password
    <input type="password" id="password" bind:value={form.password} />
  </label>

  <a href="/dump/get" use:inertia class="link">Navigate away</a>
</div>
