<script>
  import { inertia, useForm } from '@inertiajs/svelte'

  const form = useForm('form', {
    name: 'foo',
    handle: 'example',
    remember: false,
  })

  let untracked = ''

  const submit = () => {
    $form.post('/remember/form-helper/remember')
  }

  const reset = () => {
    $form.reset('handle').clearErrors('name')
  }
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" name="name" bind:value={$form.name} />
  </label>
  {#if $form.errors.name}
    <span class="name_error">{$form.errors.name}</span>
  {/if}
  <label>
    Handle
    <input type="text" id="handle" name="handle" bind:value={$form.handle} />
  </label>
  {#if $form.errors.handle}
    <span class="handle_error">{$form.errors.handle}</span>
  {/if}
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={$form.remember} />
  </label>
  {#if $form.errors.remember}
    <span class="remember_error">{$form.errors.remember}</span>
  {/if}
  <label>
    Untracked
    <input type="text" id="untracked" name="untracked" bind:value={untracked} />
  </label>

  <button on:click={submit} class="submit">Submit form</button>
  <button on:click={reset} class="reset-one">Reset one field & error</button>

  <a href="/dump/get" use:inertia class="link">Navigate away</a>
</div>
