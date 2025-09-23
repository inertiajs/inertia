<script lang="ts">
  import { Form } from '@inertiajs/svelte5'
  export let disable: boolean = false
  let url = `/form-component/disable-while-processing/${disable ? 'yes' : 'no'}/submit`
</script>

<div>
  <h1>Form Disable While Processing Test</h1>

  <Form method="post" let:errors bind:action={url} disableWhileProcessing={disable}>
    <div>
      <input type="text" name="name" placeholder="Name" value="John Doe" />
      {#if errors.name}
        <p id="error_name">{errors.name}</p>
      {/if}
    </div>

    <div>
      <button type="submit">Submit</button>
    </div>
  </Form>
</div>
