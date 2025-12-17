<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import ChildComponent from './Context/ChildComponent.svelte'
</script>

<Form action="/dump/post" method="post" let:isDirty let:errors>
  <div id="form1-parent-state">
    <span>Form 1 Parent: {isDirty ? 'dirty' : 'clean'}</span>
    {#if errors.name}<span> | Error: {errors.name}</span>{/if}
  </div>
  <input type="text" name="name" id="form1-name" value="Form 1 Name" />
  <ChildComponent formId="form1" />
</Form>

<Form action="/dump/post" method="post" let:isDirty let:errors>
  <div id="form2-parent-state">
    <span>Form 2 Parent: {isDirty ? 'dirty' : 'clean'}</span>
    {#if errors.name}<span> | Error: {errors.name}</span>{/if}
  </div>
  <input type="text" name="name" id="form2-name" value="Form 2 Name" />
  <ChildComponent formId="form2" />
</Form>
