<script lang="ts">
  import { WhenVisible, useForm, page } from '@inertiajs/svelte'

  interface Props {
    foo?: string
  }

  let { foo }: Props = $props()

  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/when-visible/preserve-errors')
  }
</script>

{#if page.props.errors?.name}
  <p id="page-error">{page.props.errors.name}</p>
{/if}
{#if form.errors.name}
  <p id="form-error">{form.errors.name}</p>
{/if}

<button type="button" onclick={submit}>Submit</button>

<div style="height: 2000px"></div>

<WhenVisible data="foo">
  {#snippet fallback()}
    <div id="loading">Loading foo...</div>
  {/snippet}

  <div id="foo">Foo: {foo}</div>
</WhenVisible>
