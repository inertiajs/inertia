<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import MethodsTestComponent from './MethodsTestComponent.svelte'
</script>

<Form action="/dump/post" method="post" let:isDirty let:hasErrors let:errors>
  <div>
    <span>{isDirty}</span>
    <span>{hasErrors}</span>
    {#if hasErrors}<pre>{JSON.stringify(errors, null, 2)}</pre>{/if}
  </div>

  <input type="text" name="name" value="Initial Name" />
  <input type="email" name="email" value="initial@example.com" />
  <textarea name="bio">Initial bio</textarea>

  <MethodsTestComponent />
</Form>
