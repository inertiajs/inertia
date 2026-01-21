<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  const form = useFormContext()
</script>

{#if form}
  <div>
    <span>Deeply Nested: Form is {form.isDirty ? 'dirty' : 'clean'}</span>
  </div>
{:else}
  <div>No context</div>
{/if}
