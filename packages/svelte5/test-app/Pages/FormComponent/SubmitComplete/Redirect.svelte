<script lang="ts">
  import { Form } from '@inertiajs/svelte5'
</script>

<div>
  <h1>Form Empty Action Test</h1>

  <Form method="post" onSubmitComplete={(props) => props.reset('name')}>
    {#snippet children({ errors })}
      <div>
        <input type="text" name="name" id="name" placeholder="Name" value="John Doe" />
        {#if errors.name}
          <div>{errors.name}</div>
        {/if}
      </div>

      <div>
        <label for="email">Email</label>
        <input type="email" name="email" id="email" value="john@doe.biz" />
        {#if errors.email}
          <div>{errors.email}</div>
        {/if}
      </div>

      <button type="submit">Submit</button>
    {/snippet}
  </Form>
</div>
