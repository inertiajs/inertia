<script module lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { Component } from 'svelte'

  export type RenderProps = {
    component: Component
    props?: PageProps
    children?: RenderProps[]
    key?: number | null
    name?: string
  }

  export type RenderFunction = {
    (component: Component, props?: PageProps, children?: RenderProps[], key?: number | null): RenderProps
    (component: Component, children?: RenderProps[], key?: number | null): RenderProps
  }

  export const h: RenderFunction = (component, propsOrChildren, childrenOrKey, key: number | null = null) => {
    const hasProps = typeof propsOrChildren === 'object' && propsOrChildren !== null && !Array.isArray(propsOrChildren)

    return {
      component,
      key: hasProps ? key : typeof childrenOrKey === 'number' ? childrenOrKey : null,
      props: hasProps ? propsOrChildren : {},
      children: hasProps
        ? ((Array.isArray(childrenOrKey)
            ? childrenOrKey
            : childrenOrKey !== null
              ? [childrenOrKey]
              : []) as RenderProps[])
        : ((Array.isArray(propsOrChildren)
            ? propsOrChildren
            : propsOrChildren !== null
              ? [propsOrChildren]
              : []) as RenderProps[]),
    }
  }
</script>

<script lang="ts">
  import Render from './Render.svelte'
  import { setContext } from 'svelte'
  import { LAYOUT_CONTEXT_KEY } from '../layoutProps.svelte'

  // svelte-ignore state_referenced_locally
  const { component, props = {}, children = [], key = null, name }: RenderProps = $props()

  // svelte-ignore state_referenced_locally
  if (children.length > 0) {
    setContext(LAYOUT_CONTEXT_KEY, {
      get staticProps() {
        return props
      },
      get name() {
        return name
      },
    })
  }
</script>

{#if component}
  {#key children?.length === 0 ? key : null}
    {#if children.length > 0}
      {@const SvelteComponent = component}
      <SvelteComponent {...props}>
        {#each children as child}
          <Render {...child} />
        {/each}
      </SvelteComponent>
    {:else}
      {@const SvelteComponent_1 = component}
      <SvelteComponent_1 {...props} />
    {/if}
  {/key}
{/if}
