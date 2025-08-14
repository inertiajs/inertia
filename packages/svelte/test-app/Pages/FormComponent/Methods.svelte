<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import type { Method } from '@inertiajs/core'

  let method: Method = 'get'
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
      <label for="active">Active</label>
      <input type="checkbox" name="active" id="active" value="true" checked />
    </div>

    <div>
      <button type="submit">
        Submit {method.toUpperCase()}
      </button>
    </div>
  </Form>
</div>