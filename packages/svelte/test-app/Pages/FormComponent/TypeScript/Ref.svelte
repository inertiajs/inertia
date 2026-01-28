<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script lang="ts">
  import type { FormComponentMethods, FormComponentRef } from '@inertiajs/core'
  import { Form } from '@inertiajs/svelte'

  interface UserForm {
    name: string
    email: string
  }

  // In Svelte, bind:this gives the component exports (methods).
  let formRef: FormComponentMethods = $state(null!)

  // Test that FormComponentRef<TForm> provides typed methods
  function testTypedRef(ref: FormComponentRef<UserForm>) {
    ref.clearErrors('name')
    ref.clearErrors('email')
    // @ts-expect-error - 'invalid_field' should not be a valid key
    ref.clearErrors('invalid_field')

    ref.reset('name')
    ref.reset('email')
    // @ts-expect-error - 'invalid_field' should not be a valid key
    ref.reset('invalid_field')

    ref.setError('name', 'Error')
    // @ts-expect-error - 'invalid_field' should not be a valid key
    ref.setError('invalid_field', 'Error')

    const data = ref.getData()
    console.log(data.name, data.email)
    // @ts-expect-error - 'invalid_field' should not be a valid key
    console.log(data.invalid_field)
  }
</script>

<div>
  <Form bind:this={formRef} action="/users" method="post">
    <input name="name" />
    <input name="email" />
    <button type="submit">Submit</button>
  </Form>

  <div>{testTypedRef.toString()}</div>
  <button onclick={() => formRef?.clearErrors('name')}>Clear name error</button>
  <button onclick={() => formRef?.reset('email')}>Reset email</button>
</div>
