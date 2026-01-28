<!--
  This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  Note: Svelte templates don't support @ts-expect-error directly. We use the {/* @ts-expect-error */ null} workaround.
  See https://github.com/sveltejs/language-tools/issues/1026
-->
<script lang="ts">
  import { createForm } from '@inertiajs/svelte'

  interface UserForm {
    name: string
    email: string
  }

  const Form = createForm<UserForm>()
</script>

<Form action="/users" method="post">
  {#snippet children({ errors, getData, clearErrors, reset, setError, valid, invalid })}
    <!-- Test typed errors -->
    {errors.name}
    {errors.email}

    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {errors.invalid_field}

    <!-- Test getData returns typed data -->
    {getData().name}
    {getData().email}

    <!-- Test clearErrors with typed fields -->
    {clearErrors('name')}
    {clearErrors('email')}
    {clearErrors('name', 'email')}

    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {clearErrors('invalid_field')}

    <!-- Test reset with typed fields -->
    {reset('name')}
    {reset('email')}

    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {reset('invalid_field')}

    <!-- Test setError with typed fields -->
    {setError('name', 'Name is required')}
    {setError('email', 'Email is invalid')}
    {setError({ name: 'Name is required', email: 'Email is invalid' })}

    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {setError('invalid_field', 'Error')}
    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {setError({ invalid_field: 'Error' })}

    <!-- Test valid/invalid with typed fields -->
    {valid('name')}
    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {valid('invalid_field')}

    {invalid('email')}
    {/* @ts-expect-error - 'invalid_field' should not be a valid key */ null}
    {invalid('invalid_field')}

    <div>
      <input name="name" />
      {#if errors.name}<span>{errors.name}</span>{/if}
      <input name="email" />
      {#if errors.email}<span>{errors.email}</span>{/if}
      <button type="submit">Submit</button>
    </div>
  {/snippet}
</Form>
