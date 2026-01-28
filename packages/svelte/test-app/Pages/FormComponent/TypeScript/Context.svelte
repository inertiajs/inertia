<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  interface UserForm {
    name: string
    email: string
  }

  const form = useFormContext<UserForm>()

  if (form) {
    form.clearErrors('name')
    form.reset('email')
    form.setError('name', 'Error')

    // @ts-expect-error - 'invalid_field' should not be a valid key
    form.clearErrors('invalid_field')

    const data = form.getData()
    console.log(data.name, data.email)

    // @ts-expect-error - 'invalid_field' should not be a valid key
    console.log(data.invalid_field)
  }
</script>

<div>Context component</div>
