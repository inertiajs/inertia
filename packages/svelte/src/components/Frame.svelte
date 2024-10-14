<script>
  import { setContext } from 'svelte'
  import { toStore } from 'svelte/store';
  import { Router } from 'inertiax-core';

  import Render, { h } from './Render.svelte';
  
  let {
    name = Math.random(),
    renderLayout = name == '_top',
    component,
    props,
    url,
    makeRequest = true,
    
    version
  } = $props()
  

  // const store = writable({ component: null, frame: null, key: null })
  
  let resolvedComponent = $state(null)
  let key = $state(null)
  
  export const router = new Router({
    frame: name,
    initialState: {component, props, url, version},
    swapComponent: async (opts) => {
      console.log('swap called for frame', name);
      ({ component: resolvedComponent, frame: {component, props, url} } = opts);
      if (!opts.preserveState) key = Date.now();
    },
  })
    
  if (url && makeRequest) {
    router.visit(url, {
      preserveState: true,
      preserveScroll: true
    })
  }
  
  if (component) {
    Promise.all([Router.resolveComponent(component), router.decryptHistory().catch(() => {})]).then(
      ([initialComponent]) => {
        resolvedComponent = initialComponent
        key = null
      },
    )
  }
  
  const page = toStore(() => ({component, props, url, version}))
  
  const context = {router, page}
  setContext('inertia', context)
  setContext(`inertia:${name}`, context)
  
  const resolvedProps = $derived(resolveProps())
  
  function resolveProps() {
    if (!resolvedComponent) return
    const child = h(resolvedComponent.default, props, [], key);
  
    const layout = renderLayout && resolvedComponent.layout;
  
    return layout ? resolveLayout(layout, child, props, key) : child;
  }
  
  function resolveLayout(layout, child, resolvedProps, key) {
    if (isLayoutFunction(layout)) {
      return layout(h, child);
    }
  
    if (Array.isArray(layout)) {
      return layout
        .slice()
        .reverse()
        .reduce((currentRender, layoutComponent) => h(layoutComponent, pageProps, [currentRender], key), child);
    }
  
    return h(layout, resolvedProps, child ? [child] : [], key);
  }
  
  function isLayoutFunction(layout) {
    return typeof layout === 'function' && layout.length === 2 && typeof layout.prototype === 'undefined';
  }

  function onclick(event) {
    if (event.defaultPrevented) return
    if (event.target.closest('[data-inertia-ignore]')) return;
    
    const el = event.target.closest('[href]')
    if (!el) return
    
    const href = el.getAttribute('href')
    const method = el.getAttribute('data-method') || 'get'
    const preserveScroll = el.hasAttribute('data-preserve-scroll')
    const preserveState = el.hasAttribute('data-preserve-state')
    
    event.preventDefault();
    
    router.visit(href, {method, preserveScroll, preserveState})
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="frame" {onclick}>
  {#if resolvedProps}
    <Render {...resolvedProps} />
  {:else}
    <slot />
  {/if}
</div>

<style>
  .frame {
    display: contents;
  }
</style>
