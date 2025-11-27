<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<Form method="post" action="/form-component/reset-on-success-fields" resetOnSuccess={['name']}>
  {#snippet children({ errors })}
    <div>
      <label for="name">Name</label>
      <input type="text" name="name" id="name" value="John Doe" />
      <p id="error_name">{errors.name || ''}</p>
    </div>

    <div>
      <label for="email">Email</label>
      <input type="email" name="email" id="email" value="john@doe.biz" />
      <p id="error_email">{errors.email || ''}</p>
    </div>

    <button type="submit">Submit</button>
  {/snippet}
</Form>
