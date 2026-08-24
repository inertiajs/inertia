<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
    baseChrome?: string
    layerChrome?: string
    name?: string
  }

  let { children, baseChrome, layerChrome, name }: Props = $props()
</script>

<div id="default-layout">
  <span>Default Layout</span>
  <div id="base-chrome">{baseChrome ?? ''}</div>
  <div id="layer-chrome">{layerChrome ?? ''}</div>
  <div id="layout-name">{name ?? ''}</div>
  {@render children?.()}
</div>
