<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store';}
  import { Router } from 'inertiax-core';
  
  import Render, { h } from './Render.svelte';
  
  const {
    name = "_top", 
    initialFrame,
    resolveComponent
  } = $props()
  
  const store = writable({ component: null, frame: null, key: null })
  
  export const router = new Router({
    frame: name,
    initialFrame,
    resolveComponent,
    swapComponent: async ({ component, frame, preserveState }) => {
      store.update((current) => ({
        component: component,
        frame,
        key: preserveState ? current.key : Date.now(),
      }));
    },
  })

  
  await Promise.all([resolveComponent(initialFrame.component), router.decryptHistory().catch(() => {})]).then(
    ([initialComponent]) => {
      store.set({
        component: initialComponent,
        frame: initialFrame,
        key: null,
      });
    },
  );
  
  const context = {router}
  setContext('frame', context)
  setContext(`router:${name}`, context)
  
  const props = $derived(resolveProps($store));
  
  function resolveProps({ component, frame, key = null }) {
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

</script>

{#if props}
  <Render {...props} />
{/if}
