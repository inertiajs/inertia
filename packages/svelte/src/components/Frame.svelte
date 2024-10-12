<script>
  import { setContext } from 'svelte'
  import { Router } from 'inertiax-core';
  
  import Render, { h } from './Render.svelte';
  
  const {
    name = "_top", 
    initialFrame,
    resolveComponent
  } = $props()
  
  // const store = writable({ component: null, frame: null, key: null })
  
  let component = $state(null)
  let frame = $state(null)
  let key = $state(null)
  
  export const router = new Router({
    frame: name,
    initialFrame,
    resolveComponent,
    swapComponent: async (opts) => {
      ({ component, frame } = opts);
      if (!opts.preserveState) key = Date.now();
    },
  })

  
  Promise.all([resolveComponent(initialFrame.component), router.decryptHistory().catch(() => {})]).then(
    ([initialComponent]) => {
      component = initialComponent
      frame = initialFrame
      key = null
    },
  );
  
  
  const context = {router, page}
  setContext('frame', context)
  setContext(`router:${name}`, context)
  
  const props = $derived(resolveProps())
  
  function resolveProps() {
    const child = h(component.default, frame.props, [], key);
    const layout = component.layout;
  
    return layout ? resolveLayout(layout, child, frame.props, key) : child;
  }
  
  function resolveLayout(layout, child, frameProps, key) {
    if (isLayoutFunction(layout)) {
      return layout(h, child);
    }
  
    if (Array.isArray(layout)) {
      return layout
        .slice()
        .reverse()
        .reduce((currentRender, layoutComponent) => h(layoutComponent, pageProps, [currentRender], key), child);
    }
  
    return h(layout, frameProps, child ? [child] : [], key);
  }
  
  function isLayoutFunction(layout) {
    return typeof layout === 'function' && layout.length === 2 && typeof layout.prototype === 'undefined';
  }

  function onclick(event: MouseEvent) {
    if (event.defaultPrevented) return
    if (event.target.closest('[data-inertia-ignore]')) return;
    
    event.preventDefault();
    
    const href = event.currentTarget.getAttribute('href');
    router.visit(href);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="frame" {onclick}>
  {#if props}
    <Render {...props} />
  {/if}
</div>

<style>
  .frame {
    display: contents;
  }
</style>
