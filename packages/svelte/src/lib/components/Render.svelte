<script context="module" lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { ComponentType } from 'svelte'

  type RenderProps = {
    component: ComponentType
    props?: PageProps
    children?: RenderProps[]
  } | null

  export const h = (component: ComponentType, props?: PageProps, children?: RenderProps[]): RenderProps => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    }
  }
</script>

<script lang="ts">
  import store from '../store'

  export let component: ComponentType
  export let props: PageProps = {}
  export let children: RenderProps[] = []
</script>

{#if $store.component}
  <!--
  Add the `key` only to the last (page) component in the tree.
  This ensures that the page component re-renders when `preserveState` is disabled,
  while the layout components are persisted across page changes. -->
  {#key children?.length === 0 ? $store.key : null}
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
