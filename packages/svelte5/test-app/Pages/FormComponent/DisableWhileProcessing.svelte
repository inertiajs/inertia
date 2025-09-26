<script lang="ts">
  import { Form } from '@inertiajs/svelte5'
  const { disable = false }: { disable?: boolean } = $props()
  let url = `/form-component/disable-while-processing/${disable ? 'yes' : 'no'}/submit`
</script>

<div>
  <h1>Form Disable While Processing Test</h1>

  <Form method="post" action={url} disableWhileProcessing={disable}>
    {#snippet children({ errors })}
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
        {#if errors.name}
          <div>{errors.name}</div>
        {/if}
      </div>

      <button type="submit">Submit</button>
    {/snippet}
  </Form>
</div>
