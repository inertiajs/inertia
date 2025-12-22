<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
    handle: 'example',
    remember: false,
  })

  const submit = () => {
    form.post('/form-helper/errors')
  }

  const clearErrors = () => {
    form.clearErrors()
  }

  const clearError = () => {
    form.clearErrors('handle')
  }

  const setErrors = () => {
    form.setError({
      name: 'Manually set Name error',
      handle: 'Manually set Handle error',
    })
  }

  const setError = () => {
    form.setError('handle', 'Manually set Handle error')
  }

  const resetAndClearErrors = () => {
    form.resetAndClearErrors()
  }

  const resetHandle = () => {
    form.resetAndClearErrors('handle')
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

  <button onclick={submit} class="submit">Submit form</button>

  <button onclick={clearErrors} class="clear">Clear all errors</button>
  <button onclick={clearError} class="clear-one">Clear one error</button>
  <button onclick={setErrors} class="set">Set errors</button>
  <button onclick={setError} class="set-one">Set one error</button>
  <button onclick={resetAndClearErrors} class="reset-all">Reset all</button>
  <button onclick={resetHandle} class="reset-handle">Reset handle</button>

  <span class="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
</div>
