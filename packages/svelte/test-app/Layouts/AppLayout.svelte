<script lang="ts">
  import { useLayoutProps } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  onMount(() => {
    window._inertia_app_layout_id = crypto.randomUUID()
  })

  const layoutProps = useLayoutProps({
    title: 'Default Title',
    showSidebar: true,
    theme: 'light',
  })
</script>

<div data-theme={$layoutProps.theme} class="app-layout">
  <header>
    <h1 class="app-title">{$layoutProps.title}</h1>
  </header>
  <div class="app-content">
    {#if $layoutProps.showSidebar}
      <aside class="sidebar">
        <span>Sidebar</span>
      </aside>
    {/if}
    <main>
      {@render children?.()}
    </main>
  </div>
</div>
