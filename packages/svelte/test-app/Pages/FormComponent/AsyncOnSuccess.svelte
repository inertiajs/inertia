<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  const onSuccess = () => new Promise<void>((resolve) => setTimeout(resolve, 1500))
</script>

<div>
  <h1>Form Async OnSuccess Test</h1>

  <Form method="post" action="/form-component/async-on-success/submit" disableWhileProcessing {onSuccess}>
    {#snippet children()}
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    {/snippet}
  </Form>
</div>
