<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    title?: string
    showSidebar?: boolean
    theme?: string
    children?: import('svelte').Snippet
  }

  let { title = 'Default Title', showSidebar = true, theme = 'light', children }: Props = $props()

  onMount(() => {
    window._inertia_app_layout_id = crypto.randomUUID()
  })
</script>

<div data-theme={theme} class="app-layout">
  <header>
    <h1 class="app-title">{title}</h1>
  </header>
  <div class="app-content">
    {#if showSidebar}
      <aside class="sidebar">
        <span>Sidebar</span>
      </aside>
    {/if}
    <main>
      {@render children?.()}
    </main>
  </div>
</div>
