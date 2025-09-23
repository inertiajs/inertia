<script context="module" lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { ComponentType } from 'svelte'

  export type RenderProps = {
    component: ComponentType
    props?: PageProps
    children?: RenderProps[]
    key?: number | null
  }

  export type RenderFunction = {
    (component: ComponentType, props?: PageProps, children?: RenderProps[], key?: number | null): RenderProps
    (component: ComponentType, children?: RenderProps[], key?: number | null): RenderProps
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
  export let component: ComponentType
  export let props: PageProps = {}
  export let children: RenderProps[] = []
  export let key: number | null = null
</script>

{#if component}
  <!--
  Add the `key` only to the last (page) component in the tree.
  This ensures that the page component re-renders when `preserveState` is disabled,
  while the layout components are persisted across page changes. -->
  {#key children?.length === 0 ? key : null}
    {#if children.length > 0}
      <svelte:component this={component} {...props}>
        {#each children as child}
          <svelte:self {...child} />
        {/each}
      </svelte:component>
    {:else}
      <svelte:component this={component} {...props} />
    {/if}
  {/key}
{/if}
