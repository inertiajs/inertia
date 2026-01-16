<script lang="ts">
  import type { FormDataConvertible } from '@inertiajs/core'
  import { Form } from '@inertiajs/svelte'

  function testGetData(getData: () => Record<string, FormDataConvertible>) {
    const data = getData()
    console.log('getData result: ' + JSON.stringify(data))
  }

  function testGetFormData(getFormData: () => FormData) {
    const formData = getFormData()
    console.log('getFormData entries: ' + JSON.stringify(Object.fromEntries(formData.entries())))
  }
</script>

<div>
  <h1>Test getData() and getFormData() Methods</h1>

  <Form>
    {#snippet children({ getData, getFormData })}
      <input type="text" id="name" name="name" />

      <button type="button" onclick={() => testGetData(getData)}> Test getData() </button>

      <button type="button" onclick={() => testGetFormData(getFormData)}> Test getFormData() </button>
    {/snippet}
  </Form>
</div>
