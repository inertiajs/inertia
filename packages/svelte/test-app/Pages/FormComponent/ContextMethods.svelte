<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import MethodsTestComponent from './Context/MethodsTestComponent.svelte'
</script>

<Form action="/dump/post" method="post" let:isDirty let:hasErrors let:errors>
  <div id="parent-state">
    <span id="parent-is-dirty">{isDirty}</span>
    <span id="parent-has-errors">{hasErrors}</span>
    {#if hasErrors}<pre id="parent-errors">{JSON.stringify(errors, null, 2)}</pre>{/if}
  </div>

  <input type="text" name="name" id="name" value="Initial Name" />
  <input type="email" name="email" id="email" value="initial@example.com" />
  <textarea name="bio" id="bio">Initial bio</textarea>

  <MethodsTestComponent />
</Form>
