<script lang="ts">
  import { page, useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
    handle: 'example',
    remember: false,
  })

  const submit = () => {
    form.post(page.url)
  }

  const submitAndReset = () => {
    form.post('/form-helper/data/redirect-back', {
      onSuccess: () => form.reset(),
    })
  }

  const resetAll = () => {
    form.reset()
  }

  const resetOne = () => {
    form.reset('handle')
  }

  const reassign = () => {
    form.defaults()
  }

  const reassignObject = () => {
    form.defaults({
      handle: 'updated handle',
      remember: true,
    })
  }

  const reassignSingle = () => {
    form.defaults('name', 'single value')
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
  <button onclick={submitAndReset} class="submit">Submit form and reset</button>

  <button onclick={resetAll} class="reset">Reset all data</button>
  <button onclick={resetOne} class="reset-one">Reset one field</button>

  <button onclick={reassign} class="reassign">Reassign current as defaults</button>
  <button onclick={reassignObject} class="reassign-object">Reassign default values</button>
  <button onclick={reassignSingle} class="reassign-single">Reassign single default</button>

  <span class="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
</div>
