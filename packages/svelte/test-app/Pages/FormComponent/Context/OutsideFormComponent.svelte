<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  const form = useFormContext()
</script>

{#if form === undefined}
  <div>Correctly returns undefined when used outside a Form component</div>
{:else}
  <div>Unexpectedly has form context</div>
{/if}
