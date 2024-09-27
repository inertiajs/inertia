<script context="module" lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { ComponentType } from 'svelte'

  export type RenderProps = {
    component: ComponentType
    props?: PageProps
    children?: RenderProps[]
    key?: number | null
  } | null

  export const h = (
    component: ComponentType,
    props?: PageProps,
    children?: RenderProps[],
    key: number | null = null,
  ): RenderProps => {
    return {
      component,
      key,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
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
