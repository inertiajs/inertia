<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  interface Props {
    disable?: boolean
  }

  let { disable = false }: Props = $props()

  // svelte-ignore state_referenced_locally
  let url = $state(`/form-component/disable-while-processing/${disable ? 'yes' : 'no'}/submit`)
</script>

<div>
  <h1>Form Disable While Processing Test</h1>

  <Form method="post" bind:action={url} disableWhileProcessing={disable}>
    {#snippet children({ errors })}
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
        {#if errors.name}
          <p id="error_name">{errors.name}</p>
        {/if}
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    {/snippet}
  </Form>
</div>
