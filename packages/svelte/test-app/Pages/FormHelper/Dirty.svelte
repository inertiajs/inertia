<script>
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
  })

  const submit = () => {
    $form.post('')
  }
</script>

<div>
    <div>Form is {#if $form.isDirty}dirty{:else}clean{/if}</div>
  <label>
    Full Name
    <input type="text" id="name" name="name" bind:value={$form.name} />
  </label>

  <button on:click={submit} class="submit">Submit form</button>
</div>
