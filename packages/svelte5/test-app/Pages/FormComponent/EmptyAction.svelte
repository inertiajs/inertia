<script lang="ts">
  import { Form } from '@inertiajs/svelte5'
</script>

<div>
  <h1>Form Empty Action Test</h1>

  <Form method="post">
    {#snippet children({ errors })}
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
        {#if errors.name}
          <div id="error_name">{errors.name}</div>
        {/if}
      </div>

      <button type="submit">Submit</button>
    {/snippet}
  </Form>
</div>
