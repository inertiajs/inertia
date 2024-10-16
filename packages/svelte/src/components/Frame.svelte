<script>
  import { BROWSER } from 'esm-env';
  import { onDestroy, setContext } from 'svelte'
  import { toStore } from 'svelte/store';
  import { Router } from 'inertiax-core';

  import Render, { h } from './Render.svelte';
  
  let {
    name = Math.random().toString(),
    renderLayout = name == '_top',
    component,
    props,
    url,
    history = true,
    makeRequest = true,
    onclick = () => {},
    
    children,
    version
  } = $props()
  
  let frame
  // const store = writable({ component: null, frame: null, key: null })
  const bothOnclick = function(event) {
    onclick(event)
    defaultOnclick(event)
  }
  
  let resolvedComponent = $state(null)
  let key = $state(null)
  
  export const router = new Router();
  
  const historyFrame = router.init(history, {
    frame: name,
    initialState: {component, props, url, version},
    swapComponent: async (opts) => {
      console.log('swapComponent', name, url, opts.forgetState);
      ({ component: resolvedComponent, frame: {component, props, url} } = opts);
      if (opts.forgetState === true || opts.forgetState === name) key = Date.now();
    },
  })
  
  if (historyFrame) {
    makeRequest = false;
    ({ component, props, url } = historyFrame);
  }
  
  if (url && makeRequest) {
    router.visit(url, {
      forgetState: false,
      preserveScroll: true,
      replace: history || undefined
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
  
  const page = toStore(() => ({component, props, url}))
  
  const context = {router, page, frame}
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

  function defaultOnclick(event) {
    if (event.defaultPrevented) return
    if (event.target.closest('[data-inertia-ignore]')) return;
    
    const el = event.target.closest('[href]')
    
    if (!el) return
    
    const href = el.getAttribute('href')
    
    if (new URL(href, window.location.href).host !== window.location.host) return
    
    event.preventDefault();
    router.visit(href, {...el.dataset})
  }
  
  if (BROWSER) onDestroy(function() {
    router.destroy()
  })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div style="display: contents" class="frame" onclick={bothOnclick} bind:this={frame}>
  {#if resolvedProps}
    <Render {...resolvedProps} />
  {:else}
    {@render children?.()}
  {/if}
</div>
