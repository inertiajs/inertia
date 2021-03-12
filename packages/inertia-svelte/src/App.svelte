<script>
  import { Inertia } from '@inertiajs/inertia'
  import store from './store'

  export let
    initialPage,
    resolveComponent,
    resolveErrors,
    transformProps

  Inertia.init({
    initialPage,
    resolveComponent,
    resolveErrors,
    transformProps,
    swapComponent: async ({ component, page, preserveState }) => {
      store.update(current => ({
        component,
        layout: (() => {
          if (!component.layout) {
            return []
          } else if (Array.isArray(component.layout)) {
            if (component.layout.length > 5) {
              throw new Error('The Svelte adapter only supports up to five nested layouts.')
            }
            return component.layout
          } else {
            return [component.layout]
          }
        })(),
        page,
        key: preserveState ? current.key : Date.now(),
      }))
    },
  })
</script>

{#if $store.component}
  {#if $store.layout.length > 0}
    <svelte:component this={$store.layout[0]}>
      {#if $store.layout.length > 1}
        <svelte:component this={$store.layout[1]}>
          {#if $store.layout.length > 2}
            <svelte:component this={$store.layout[2]}>
              {#if $store.layout.length > 3}
                <svelte:component this={$store.layout[3]}>
                  {#if $store.layout.length > 4}
                    <svelte:component this={$store.layout[4]}>
                      {#key $store.key}
                        <svelte:component this={$store.component.default} {...$store.page.props} />
                      {/key}
                    </svelte:component>
                  {:else}
                    {#key $store.key}
                      <svelte:component this={$store.component.default} {...$store.page.props} />
                    {/key}
                  {/if}
                </svelte:component>
              {:else}
                {#key $store.key}
                  <svelte:component this={$store.component.default} {...$store.page.props} />
                {/key}
              {/if}
            </svelte:component>
          {:else}
            {#key $store.key}
              <svelte:component this={$store.component.default} {...$store.page.props} />
            {/key}
          {/if}
        </svelte:component>
      {:else}
        {#key $store.key}
          <svelte:component this={$store.component.default} {...$store.page.props} />
        {/key}
      {/if}
    </svelte:component>
  {:else}
    {#key $store.key}
      <svelte:component this={$store.component.default} {...$store.page.props} />
    {/key}
  {/if}
{/if}
