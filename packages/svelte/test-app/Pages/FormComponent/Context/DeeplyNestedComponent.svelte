<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  const form = useFormContext()
</script>

{#if $form}
  <div id="deeply-nested-state">
    <span>Deeply Nested: Form is {$form.isDirty ? 'dirty' : 'clean'}</span>
  </div>
{:else}
  <div id="deeply-nested-no-context">No context</div>
{/if}
