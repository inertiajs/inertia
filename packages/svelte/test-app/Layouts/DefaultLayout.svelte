<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div id="default-layout">
  <span>Default Layout</span>
  {@render children?.()}
</div>
