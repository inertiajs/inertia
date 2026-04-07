<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script lang="ts">
  import { createForm } from '@inertiajs/svelte'

  interface UserForm {
    name: string
    email: string
  }

  const TypedForm = createForm<UserForm>()
</script>

<TypedForm method="post" action="/form-component/types" resetOnSuccess={['name', 'email']} resetOnError={['name']}>
  {#snippet children({ errors, getData, clearErrors, reset })}
    {errors.name} {errors.email}
    {getData().name} {getData().email}
    {clearErrors('name', 'email')}
    {reset('name')}
    {reset('email')}
    <div>Form content</div>
  {/snippet}
</TypedForm>

<TypedForm method="post" action="/form-component/types" resetOnSuccess={true} resetOnError={false}>
  <div>Boolean reset</div>
</TypedForm>
