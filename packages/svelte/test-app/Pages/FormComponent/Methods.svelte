<script>
  import { Form } from '@inertiajs/svelte'
  
  let method = 'get'
</script>

<div>
  <h1>HTTP Methods</h1>
  
  <div>
    <button on:click={() => method = 'get'}>GET</button>
    <button on:click={() => method = 'post'}>POST</button>
    <button on:click={() => method = 'put'}>PUT</button>
    <button on:click={() => method = 'patch'}>PATCH</button>
    <button on:click={() => method = 'delete'}>DELETE</button>
  </div>

  <div>Current method: {method}</div>

  <Form action={`/dump/${method}`} {method}>
    <div>
      <input type="text" name="name" placeholder="Name" value="John Doe" />
    </div>

    <div>
      <input type="checkbox" name="active" value="true" checked />
      <label>Active</label>
    </div>

    <div>
      <button type="submit">
        Submit {method.toUpperCase()}
      </button>
    </div>
  </Form>
</div>