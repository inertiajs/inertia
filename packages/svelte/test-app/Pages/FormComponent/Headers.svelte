<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let headers: Record<string, string> = $state({
    'X-Foo': 'Bar',
  })

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
    <button type="button" onclick={addCustomHeader}>Add Custom Header</button>
  </div>

  <button type="submit">Submit</button>
</Form>
