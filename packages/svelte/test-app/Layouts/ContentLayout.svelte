<script lang="ts">
  import { useLayoutProps } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  onMount(() => {
    window._inertia_content_layout_id = crypto.randomUUID()
  })

  const layoutProps = useLayoutProps({
    padding: 'md',
    maxWidth: 'lg',
  })
</script>

<div class="content-layout" data-padding={$layoutProps.padding} data-max-width={$layoutProps.maxWidth}>
  <div class="content-wrapper">
    {@render children?.()}
  </div>
</div>
