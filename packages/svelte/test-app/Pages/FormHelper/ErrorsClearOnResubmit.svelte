<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
    handle: '',
  })

  const submit = () => {
    form.post('/form-helper/errors/clear-on-resubmit')
  }
</script>

<div>
  <label>
    Name
    <input type="text" id="name" name="name" bind:value={form.name} />
  </label>
  {#if form.errors.name}
    <span id="name-error">{form.errors.name}</span>
  {/if}

  <label>
    Handle
    <input type="text" id="handle" name="handle" bind:value={form.handle} />
  </label>
  {#if form.errors.handle}
    <span id="handle-error">{form.errors.handle}</span>
  {/if}

  <button onclick={submit} id="submit">Submit</button>

  <span class="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
</div>
