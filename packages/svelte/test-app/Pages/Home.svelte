<script>
  import { inertia, page, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  const visitsMethod = () => {
    router.visit('/visits/method')
  }

  const visitsReplace = () => {
    router.get('/visits/replace')
  }

  const redirect = () => {
    router.post('/redirect')
  }

  const redirectExternal = () => {
    router.post('/redirect-external')
  }

  onMount(() => {
    window._inertia_page_key = crypto.randomUUID()
    window._inertia_props = $page.props
    window._plugin_global_props = {}
  })
</script>

<div>
  <span class="text">This is the Test App Entrypoint page</span>

  <a href="/links/method" use:inertia class="links-method">Basic Links</a>
  <a href="/links/replace" use:inertia class="links-replace">'Replace' Links</a>

  <a href="#" on:click={visitsMethod} class="visits-method">Manual basic visits</a>
  <a href="#" on:click={visitsReplace} class="visits-replace">Manual 'Replace' visits</a>

  <button use:inertia={{ href: '/redirect', method: 'post' }} class="links-redirect">Internal Redirect Link</button>
  <a href="#" on:click={redirect} class="visits-redirect">Manual Redirect visit</a>

  <button use:inertia={{ href: '/redirect-external', method: 'post' }} class="links-redirect-external"
    >External Redirect Link</button
  >
  <a href="#" on:click={redirectExternal} class="visits-redirect-external">Manual External Redirect visit</a>
</div>
