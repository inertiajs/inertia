<script>
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
    foo: [],
  })

  const submit = () => {
    $form.post('')
  }

  const defaults = () => {
    $form.defaults()
  }

  const pushValue = () => {
    $form.foo.push('bar')
  }

  const dataAndDefaults = () => {
    pushValue()
    defaults()
  }
</script>

<div>
    <div>Form is {#if $form.isDirty}dirty{:else}clean{/if}</div>
  <label>
    Full Name
    <input type="text" id="name" name="name" bind:value={$form.name} />
  </label>

  <button on:click={submit} class="submit">Submit form</button>
  <button on:click={defaults} class="defaults">Defaults</button>
  <button on:click={dataAndDefaults} class="data-and-defaults">Data and Defaults</button>
  <button on:click={pushValue} class="push">Push value</button>

</div>
