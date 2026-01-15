<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  interface Props {
    formId?: string | undefined
  }

  let { formId = undefined }: Props = $props()

  const form = useFormContext()
</script>

{#if form}
  <div>
    <span>Child: Form is {form.isDirty ? 'dirty' : 'clean'}</span>
    {#if form.hasErrors}<span> | Child: Form has errors</span>{/if}
    {#if form.processing}<span> | Child: Form is processing</span>{/if}
    {#if form.wasSuccessful}<span> | Child: Form was successful</span>{/if}
    {#if form.recentlySuccessful}<span> | Child: Form recently successful</span>{/if}
    {#if form.errors.name}<span> | Error: {form.errors.name}</span>{/if}
  </div>
{:else}
  <div>No form context available</div>
{/if}

<button
  type="button"
  onclick={() => form?.setError('name', formId ? 'Error from child' : 'Error set from child component')}
>
  Set Error
</button>
<button type="button" onclick={() => form?.clearErrors('name')}>Clear Error</button>
{#if !formId}
  <button type="button" onclick={() => form?.submit()}>Submit from Child</button>
  <button type="button" onclick={() => form?.reset()}>Reset from Child</button>
  <button type="button" onclick={() => form?.defaults()}>Set Defaults</button>
{/if}
