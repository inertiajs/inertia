<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  const form = useFormContext()
</script>

{#if $form === undefined}
  <div id="no-context-message">Correctly returns undefined when used outside a Form component</div>
{:else}
  <div id="unexpected-context">Unexpectedly has form context</div>
{/if}
