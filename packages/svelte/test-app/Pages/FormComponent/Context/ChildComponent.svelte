<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  export let formId: string | undefined = undefined

  const form = useFormContext()
</script>

{#if $form}
  <div id={formId ? `${formId}-child-state` : 'child-state'}>
    <span>Child: Form is {$form.isDirty ? 'dirty' : 'clean'}</span>
    {#if $form.hasErrors}<span> | Child: Form has errors</span>{/if}
    {#if $form.errors.name}<span id={formId ? undefined : 'child_error_name'}> | Error: {$form.errors.name}</span>{/if}
  </div>
{:else}
  <div id="child-no-context">No form context available</div>
{/if}

<button type="button" id={formId ? `${formId}-set-error` : 'child-set-error-button'} on:click={() => $form?.setError('name', formId ? 'Error from child' : 'Error set from child component')}>
  Set Error
</button>
<button type="button" id={formId ? `${formId}-clear-error` : 'child-clear-errors-button'} on:click={() => $form?.clearErrors('name')}>
  Clear Error
</button>
{#if !formId}
  <button type="button" id="child-submit-button" on:click={() => $form?.submit()}>Submit from Child</button>
  <button type="button" id="child-reset-button" on:click={() => $form?.reset()}>Reset from Child</button>
  <button type="button" id="child-defaults-button" on:click={() => $form?.defaults()}>Set Defaults</button>
{/if}
