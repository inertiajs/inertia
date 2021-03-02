<script>
  import { Inertia } from '@inertiajs/inertia'
  import Render from './Render.svelte'
  import store from './store'

  export let initialPage, resolveComponent, resolveErrors, transformProps

  Inertia.init({
    initialPage,
    resolveComponent,
    resolveErrors,
    transformProps,
    swapComponent: async ({ component, page, preserveState }) => {
      store.update((current) => ({
        component,
        layout: (() => {
          if (!component.layout) {
            return []
          } else if (Array.isArray(component.layout)) {
            return component.layout
          } else {
            return [component.layout]
          }
        })(),
        page,
        key: preserveState ? current.key : Date.now()
      }))
    }
  })
</script>

{#if $store.component}
  <Render />
{/if}
