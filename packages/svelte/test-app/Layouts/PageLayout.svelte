<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div id="page-layout">
  <span>Page Layout</span>
  {@render children?.()}
</div>
