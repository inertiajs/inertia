<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import ChildComponent from './Context/ChildComponent.svelte'
  import NestedComponent from './Context/NestedComponent.svelte'
  import OutsideFormComponent from './Context/OutsideFormComponent.svelte'
</script>

<Form action="/dump/post" method="post" let:isDirty let:hasErrors let:errors>
  <div id="parent-state">
    <span>Parent: Form is {isDirty ? 'dirty' : 'clean'}</span>
    {#if hasErrors}<span> | Parent: Form has errors</span>{/if}
    {#if errors.name}<span id="parent_error_name"> | {errors.name}</span>{/if}
  </div>

  <input type="text" name="name" id="name" value="John Doe" />
  <input type="email" name="email" id="email" value="john@example.com" />

  <ChildComponent />
  <NestedComponent />
</Form>

<OutsideFormComponent />
