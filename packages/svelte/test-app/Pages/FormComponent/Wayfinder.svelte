<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  const wayfinderUrl = (): {
    url: string
    method: 'post'
  } => ({
    url: '/dump/post',
    method: 'post',
  })
</script>

<div>
  <h1>Wayfinder Example</h1>

  <Form action={wayfinderUrl()}>
    <div>
      <input type="text" name="name" placeholder="Name" value="John Doe" />
    </div>

    <div>
      <input type="checkbox" name="active" value="true" checked />
      <label>Active</label>
    </div>

    <div>
      <button type="submit">Submit</button>
    </div>
  </Form>
</div>