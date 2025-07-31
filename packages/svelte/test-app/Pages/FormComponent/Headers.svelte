<script>
  import { Form } from '@inertiajs/svelte'

  let headers = {
    'X-Foo': 'Bar',
  }

  function addCustomHeader() {
    headers = {
      ...headers,
      'X-Custom': 'MyCustomValue',
    }
  }
</script>

<Form action="/dump/post" method="post" {headers}>
  <h1>Form Headers</h1>

  <div>
    <button type="button" on:click={addCustomHeader}>Add Custom Header</button>
  </div>

  <button type="submit">Submit</button>
</Form>