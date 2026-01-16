<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import ChildComponent from './ChildComponent.svelte'
</script>

<Form action="/dump/post" method="post">
  {#snippet children({ isDirty, errors })}
    <div>
      <span>Form 1 Parent: {isDirty ? 'dirty' : 'clean'}</span>
      {#if errors.name}<span> | Error: {errors.name}</span>{/if}
    </div>
    <input type="text" name="name" value="Form 1 Name" />
    <ChildComponent formId="form1" />
  {/snippet}
</Form>

<Form action="/dump/post" method="post">
  {#snippet children({ isDirty, errors })}
    <div>
      <span>Form 2 Parent: {isDirty ? 'dirty' : 'clean'}</span>
      {#if errors.name}<span> | Error: {errors.name}</span>{/if}
    </div>
    <input type="text" name="name" value="Form 2 Name" />
    <ChildComponent formId="form2" />
  {/snippet}
</Form>
