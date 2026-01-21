<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>OnSubmitComplete Reset Test</h1>

  <Form method="post" onSubmitComplete={(props) => props.reset('name')}>
    {#snippet children({ errors })}
      <div>
        <input type="text" name="name" id="name" placeholder="Name" value="John Doe" />
        {#if errors.name}
          <p id="error_name">{errors.name}</p>
        {/if}
      </div>

      <div>
        <input type="email" name="email" id="email" placeholder="Email" value="john@doe.biz" />
        {#if errors.email}
          <p id="error_email">{errors.email}</p>
        {/if}
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    {/snippet}
  </Form>
</div>
