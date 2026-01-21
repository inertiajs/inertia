<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import ChildComponent from './ChildComponent.svelte'
  import NestedComponent from './NestedComponent.svelte'
  import OutsideFormComponent from './OutsideFormComponent.svelte'
</script>

<Form action="/dump/post" method="post">
  {#snippet children({ isDirty, hasErrors, errors })}
    <div>
      <span>Parent: Form is {isDirty ? 'dirty' : 'clean'}</span>
      {#if hasErrors}<span> | Parent: Form has errors</span>{/if}
      {#if errors.name}<span> | {errors.name}</span>{/if}
    </div>

    <input type="text" name="name" value="John Doe" />
    <input type="email" name="email" value="john@example.com" />

    <ChildComponent />
    <NestedComponent />
  {/snippet}
</Form>

<OutsideFormComponent />
