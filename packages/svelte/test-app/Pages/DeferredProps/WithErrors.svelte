<script lang="ts">
  import { Deferred, page, useForm } from '@inertiajs/svelte'

  export let foo: { text: string } | undefined

  const form = useForm({
    name: '',
  })

  const submit = () => {
    $form.post('/deferred-props/with-errors')
  }
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div>Loading foo...</div>
  </svelte:fragment>

  <div id="foo">{foo?.text}</div>
</Deferred>

{#if $page.props.errors?.name}
  <p id="page-error">{$page.props.errors.name}</p>
{/if}
{#if $form.errors.name}
  <p id="form-error">{$form.errors.name}</p>
{/if}

<button type="button" on:click={submit}>Submit</button>
