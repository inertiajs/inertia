<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div id="admin-layout">
  <span>Admin Layout</span>
  {@render children?.()}
</div>
