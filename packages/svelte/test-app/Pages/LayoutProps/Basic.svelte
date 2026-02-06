<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout = AppLayout
</script>

<script lang="ts">
  import { Link, setLayoutProps } from '@inertiajs/svelte'

  let sidebarVisible = $state(true)

  setLayoutProps({
    title: 'Basic Layout Props',
    showSidebar: sidebarVisible,
  })

  function toggleSidebar() {
    sidebarVisible = !sidebarVisible
    setLayoutProps({ showSidebar: sidebarVisible })
  }
</script>

<div>
  <h2>Basic Layout Props Page</h2>
  <p>This page demonstrates setting layout props dynamically.</p>

  <div>
    <button type="button" onclick={toggleSidebar}>Toggle Sidebar</button>
    <span>Sidebar: {sidebarVisible ? 'visible' : 'hidden'}</span>
  </div>

  <nav>
    <Link href="/layout-props/navigate">Go to Navigate Page</Link>
  </nav>
</div>
