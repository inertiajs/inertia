<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import MethodsTestComponent from './MethodsTestComponent.svelte'
</script>

<Form action="/form-component/context/methods" method="post">
  {#snippet children({ errors })}
    {#if Object.keys(errors).length}<pre>{JSON.stringify(errors, null, 2)}</pre>{/if}

    <input type="text" name="name" value="Initial Name" />
    <input type="email" name="email" value="initial@example.com" />
    <textarea name="bio">Initial bio</textarea>

    <MethodsTestComponent />
  {/snippet}
</Form>
