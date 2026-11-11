<script module lang="ts">
  import { usePage as moduleScopeUsePage } from '@inertiajs/svelte'

  const moduleScopePage = moduleScopeUsePage()

  declare global {
    interface Window {
      moduleScopePageComponent: string
      moduleScopePageUrl: string
    }
  }

  window.moduleScopePageComponent = moduleScopePage.component
  window.moduleScopePageUrl = moduleScopePage.url
</script>

<script lang="ts">
  import { usePage } from '@inertiajs/svelte'

  const page = usePage()
</script>

<div>Module scope page</div>
<div data-testid="module-scope-page">{page.component}|{page.url}</div>
