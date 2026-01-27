<script lang="ts">
  import { WhenVisible, useForm, page } from '@inertiajs/svelte'

  export let foo: string | undefined = undefined

  const form = useForm({ name: '' })

  function submit() {
    $form.post('/when-visible/preserve-errors')
  }
</script>

{#if $page.props.errors?.name}
  <p id="page-error">{$page.props.errors.name}</p>
{/if}
{#if $form.errors.name}
  <p id="form-error">{$form.errors.name}</p>
{/if}

<button type="button" on:click={submit}>Submit</button>

<div style="height: 2000px"></div>

<WhenVisible data="foo">
  <div slot="fallback" id="loading">Loading foo...</div>

  <div id="foo">Foo: {foo}</div>
</WhenVisible>
