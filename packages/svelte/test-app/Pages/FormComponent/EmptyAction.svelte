<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Empty Action Test</h1>

  <Form method="post">
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
