<script lang="ts">
  import { useForm } from '@inertiajs/svelte5'

  const form = useForm({
    name: 'foo',
    foo: [] as string[],
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

  const submitAndSetDefaults = () => {
    $form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => $form.defaults(),
    })
  }

  const submitAndSetCustomDefaults = () => {
    $form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => $form.defaults({ name: 'Custom Default', foo: [] }),
    })
  }
</script>

<div>
  <div>
    Form is {#if $form.isDirty}dirty{:else}clean{/if}
  </div>
  <label>
    Full Name
    <input type="text" id="name" name="name" bind:value={$form.name} />
  </label>

  <button on:click={submit} class="submit">Submit form</button>
  <button on:click={defaults} class="defaults">Defaults</button>
  <button on:click={dataAndDefaults} class="data-and-defaults">Data and Defaults</button>
  <button on:click={pushValue} class="push">Push value</button>

  <button on:click={submitAndSetDefaults} class="submit-and-set-defaults"> Submit and setDefaults </button>

  <button on:click={submitAndSetCustomDefaults} class="submit-and-set-custom-defaults">
    Submit and setDefaults custom
  </button>
</div>
