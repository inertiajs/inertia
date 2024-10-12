<script>
  import { setContext } from 'svelte'
  import { toStore } from 'svelte/store';
  import { Router } from 'inertiax-core';
  
  import Render, { h } from './Render.svelte';
  
  let {
    name = Math.random(),
    src,
    initialFrame,
    renderLayout = name == '_top'
  } = $props()
  
  
  console.log('new frame:', name, src, initialFrame)
  // const store = writable({ component: null, frame: null, key: null })
  
  let resolvedComponent = $state(null)
  let frame = $state(initialFrame)
  let key = $state(null)
  
  export const router = new Router({
    frame: name,
    initialFrame,
    swapComponent: async (opts) => {
      ({ component: resolvedComponent, frame } = opts);
      if (!opts.preserveState) key = Date.now();
    },
  })
    
  if (src) {
    router.visit(src)
  }
  
  if (initialFrame?.component) {
    Promise.all([Router.resolveComponent(initialFrame.component), router.decryptHistory().catch(() => {})]).then(
      ([initialComponent]) => {
        resolvedComponent = initialComponent
        frame = initialFrame
        key = null
      },
    )
  }
  
  const page = toStore(() => frame)
  
  const context = {router, page}
  setContext('frame', context)
  setContext(`router:${name}`, context)
  
  const resolvedProps = $derived(resolveProps())
  
  
  function resolveProps() {
    if (!resolvedComponent) return
    
    const child = h(resolvedComponent.default, frame.props, [], key);
    const layout = renderLayout && resolvedComponent.layout;
  
    return layout ? resolveLayout(layout, child, frame.props, key) : child;
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
    
    event.preventDefault();
    
    const href = event.target.closest('[href]')?.getAttribute('href')
    if (!href) return
    
    router.visit(href);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="frame" {onclick}>
  {#if resolvedProps}
    <Render {...resolvedProps} />
  {/if}
</div>

<style>
  .frame {
    display: contents;
  }
</style>
