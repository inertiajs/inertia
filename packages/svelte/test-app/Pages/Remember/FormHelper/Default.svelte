<script lang="ts">
  import { inertia, useForm } from '@inertiajs/svelte'

  let untracked = $state('')

  const form = useForm({
    name: 'foo',
    handle: 'example',
    remember: false,
  })

  const submit = () => {
    form.post('/remember/form-helper/default')
  }
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" name="name" bind:value={form.name} />
  </label>
  {#if form.errors.name}
    <span class="name_error">{form.errors.name}</span>
  {/if}
  <label>
    Handle
    <input type="text" id="handle" name="handle" bind:value={form.handle} />
  </label>
  {#if form.errors.handle}
    <span class="handle_error">{form.errors.handle}</span>
  {/if}
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={form.remember} />
  </label>
  {#if form.errors.remember}
    <span class="remember_error">{form.errors.remember}</span>
  {/if}
  <label>
    Untracked
    <input type="text" id="untracked" name="untracked" bind:value={untracked} />
  </label>

  <button onclick={submit} class="submit">Submit form</button>

  <a href="/dump/get" use:inertia class="link">Navigate away</a>
</div>
