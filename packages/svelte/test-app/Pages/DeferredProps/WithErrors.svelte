<script lang="ts">
  import { Deferred, page, useForm } from '@inertiajs/svelte'

  interface Props {
    foo: { text: string } | undefined
  }

  let { foo }: Props = $props()

  const form = useForm({
    name: '',
  })

  const submit = () => {
    form.post('/deferred-props/with-errors')
  }
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}

  <div id="foo">{foo?.text}</div>
</Deferred>

{#if page.props.errors?.name}
  <p id="page-error">{page.props.errors.name}</p>
{/if}
{#if form.errors.name}
  <p id="form-error">{form.errors.name}</p>
{/if}

<button type="button" onclick={submit}>Submit</button>
