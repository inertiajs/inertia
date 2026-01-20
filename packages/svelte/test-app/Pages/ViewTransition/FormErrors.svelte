<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({ name: '' })

  const submit = () => {
    $form.post('/view-transition/form-errors', {
      viewTransition: (viewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      },
    })
  }
</script>

<div>
  <h1>View Transition Form Errors Test</h1>

  <label>
    Name
    <input id="name" bind:value={$form.name} type="text" name="name" />
  </label>

  {#if $form.errors.name}
    <p class="name_error">{$form.errors.name}</p>
  {/if}

  <button class="submit" on:click={submit}>Submit with View Transition</button>
</div>
